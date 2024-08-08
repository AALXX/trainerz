import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import utilFunctions from '../../util/utilFunctions';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const NAMESPACE = 'ClientPackageServiceManager';

/**
 * Validates and cleans the CustomRequest form
 */
const CustomRequestValidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return {
            errorMsg: error.msg,
        };
    },
});

/**
 * file storage
 */
const storage = multer.diskStorage({
    destination: (req: CustomRequest, file: any, callback: any) => {
        callback(null, `${process.env.ACCOUNTS_FOLDER_PATH}/ProgramsTmp`);
    },
    filename: (req: CustomRequest, file, cb: any) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req: CustomRequest, file: any, cb: any) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const programUpload = multer({
    storage: storage,
    // fileFilter: fileFilter,
}).fields([
    {
        name: 'workoutProgram',
        maxCount: 1,
    },
]);

const UploadWorkoutProgram = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('UPLOAD_WORKOUT_PROGRAM', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    programUpload(req, res, async (err: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().map((error) => {
                logging.error('REGISTER_USER_FUNC', error.msg);
            });

            return res.status(400).json({ errors: errors.array() });
        }

        if (err) {
            logging.error(NAMESPACE, err.message);
            return res.status(500).json({ error: true, errormsg: 'File upload error' });
        }

        const userPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);
        if (!userPublicToken) {
            return res.status(400).json({ error: true, errormsg: 'Invalid user token' });
        }
        const ProgramToken = utilFunctions.CreateToken();

        fs.mkdir(`${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/Program_${ProgramToken}`, (err) => {
            if (err) {
                logging.error(NAMESPACE, err.message);
                return res.status(500).json({ error: true, errormsg: 'Directory creation error' });
            }

            const programFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['workoutProgram']?.[0];

            if (!programFile) {
                return res.status(400).json({ error: true, errormsg: 'Video file or thumbnail not provided' });
            }

            fs.rename(
                `${process.env.ACCOUNTS_FOLDER_PATH}/ProgramsTmp/${programFile.originalname}`,
                `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/Program_${ProgramToken}/programFile${path.extname(programFile.originalname)}`,
                async (err) => {
                    if (err) {
                        logging.error(NAMESPACE, err.message);
                        return res.status(500).json({ error: true, errormsg: 'File renaming error' });
                    }

                    const success = await SendProgramDataToDb(req, userPublicToken, ProgramToken, req.body.ProgramName, programFile.originalname);
                    if (!success) {
                        return res.status(500).json({ error: true, errormsg: 'Database error' });
                    }

                    return res.status(200).json({ error: false });
                },
            );
        });
    });
};

/**
 * Sends program data to the database.
 * @param req - The custom request object.
 * @param userPublicToken - The public token of the user.
 * @param programToken - The token of the program.
 * @param programName - The name of the program.
 * @param fileName - The name of the file.
 * @returns `true` if the program data was successfully sent to the database, `false` otherwise.
 */
const SendProgramDataToDb = async (req: CustomRequest, userPublicToken: string, programToken: string, programName: string, fileName: string) => {
    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const SqlQuery = `INSERT INTO programs (ProgramName, FileName, OwnerToken, ProgramToken)
        VALUES($1, $2, $3, $4)`;
        await query(connection, SqlQuery, [programName, fileName, userPublicToken, programToken]);
        return true;
    } catch (error) {
        return false;
    }
};

const GetAllPrograms = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_ALL_PROGRAMS', error.errorMsg);
        });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const userPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);
        if (!userPublicToken) {
            return res.status(400).json({ error: true, errormsg: 'Invalid user token' });
        }

        const SqlQuery = `SELECT ProgramName, ProgramToken FROM programs WHERE OwnerToken = $1`;
        const programs = await query(connection, SqlQuery, [userPublicToken]);
        return res.status(200).json({ error: false, programs: programs });
    } catch (error) {
        return res.status(200).json({ error: true, errormsg: 'an error has ocurred' });
    }
};

const GetProgramData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_PROGRAM_DATA', error.errorMsg);
        });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const userPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);
        if (!userPublicToken) {
            return res.status(400).json({ error: true, errormsg: 'Invalid user token' });
        }

        const SqlQuery = `SELECT ProgramName, FileName FROM programs WHERE ProgramToken = $1`;
        const programs = await query(connection, SqlQuery, [userPublicToken]);
        return res.status(200).json({ error: false, programs: programs });
    } catch (error) {
        return res.status(200).json({ error: true, errormsg: 'an error has ocurred' });
    }
};

export default { UploadWorkoutProgram, GetAllPrograms, GetProgramData };
