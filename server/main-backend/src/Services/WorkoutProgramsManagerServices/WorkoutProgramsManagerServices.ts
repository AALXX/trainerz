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

                    const success = await SendProgramDataToDb(req, userPublicToken, ProgramToken, req.body.ProgramName);
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
 * @returns `true` if the program data was successfully sent to the database, `false` otherwise.
 */
const SendProgramDataToDb = async (req: CustomRequest, userPublicToken: string, programToken: string, programName: string) => {
    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const InserProgramSqlQuery = `INSERT INTO programs (ProgramName, OwnerToken, ProgramToken)
        VALUES($1, $2, $3)`;
        await query(connection, InserProgramSqlQuery, [programName, userPublicToken, programToken], true);
        
        const GrantPermissionSqlQuery = `INSERT INTO program_premissions (ProgramToken, UserPublicToken)
        VALUES($1, $2)`;
        
        await query(connection, GrantPermissionSqlQuery, [programToken, userPublicToken]);
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

    let connection;
    try {
        connection = await connect(req.pool!);

        if (!connection) {
            return res.status(500).json({ error: true, errormsg: 'Database connection failed' });
        }

        const userPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);
        if (!userPublicToken) {
            return res.status(400).json({ error: true, errormsg: 'Invalid user token' });
        }

        const PermissionCheckSqlQuery = `SELECT * FROM program_premissions WHERE ProgramToken = $1 AND UserPublicToken = $2`;
        const PermissionCheck = await query(connection, PermissionCheckSqlQuery, [req.params.ProgramToken, userPublicToken], true);
        if (Object.keys(PermissionCheck).length === 0) {
            connection.release();
            return res.status(403).json({ error: true, errormsg: 'Permission denied' });
        }

        const SqlQuery = `SELECT ProgramName, ProgramToken, OwnerToken FROM programs WHERE ProgramToken = $1 LIMIT 1`;
        const program = await query(connection, SqlQuery, [req.params.ProgramToken]);

        if (program.rowCount === 0) {
            return res.status(404).json({ error: true, errormsg: 'Program not found' });
        }

        const filePath = path.resolve(`${process.env.ACCOUNTS_FOLDER_PATH}/${program[0].ownertoken}/Program_${req.params.ProgramToken}/programFile.xlsx`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="programFile.xlsx"`);

        const readStream = fs.createReadStream(filePath);

        readStream
            .pipe(res)
            .on('error', (err) => {
                logging.error('GET_PROGRAM_DATA', `File streaming error: ${err.message}`);
                return res.status(500).json({ error: true, errormsg: 'File streaming error' });
            });
    } catch (error: any) {
        logging.error('GET_PROGRAM_DATA', `An error occurred: ${error.message}`);
        res.status(500).json({ error: true, errormsg: 'An error has occurred' });
    }
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const streamFile = async (res: Response, filePath: string): Promise<void> => {
    // const stat = await fs.promises.stat(filePath);

    // if (stat.size > MAX_FILE_SIZE) {
    //     res.status(413).json({ error: true, errormsg: 'File too large to stream' });
    //     return;
    // }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="programFile.xlsx"`);

    const readStream = fs.createReadStream(filePath);

    return await new Promise((resolve) => {
        readStream
            .pipe(res)
            .on('finish', resolve)
            .on('error', (err) => {
                logging.error('GET_PROGRAM_DATA', `File streaming error: ${err.message}`);
                return res.status(500).json({ error: true, errormsg: 'File streaming error' });
            });
    });
};

export default { UploadWorkoutProgram, GetAllPrograms, GetProgramData };
