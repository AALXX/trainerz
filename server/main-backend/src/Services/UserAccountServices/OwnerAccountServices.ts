import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { connect, CustomRequest, query } from '../../config/postgresql';
import utilFunctions from '../../util/utilFunctions';

const NAMESPACE = 'OwnerAccountServices';

/**
 * file storage
 */
const storage = multer.diskStorage({
    destination: (req: CustomRequest, file: any, callback: any) => {
        callback(null, `${process.env.ACCOUNTS_FOLDER_PATH}/PhotosTmp`);
    },

    filename: (req: CustomRequest, file: any, cb: any) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req: CustomRequest, file: any, cb: any) => {
    // reject all files except jpeg
    if (file.mimetype === 'image/jpeg' || 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

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
 * Register User
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const RegisterUser = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            logging.error('REGISTER_USER_FUNC', error.errorMsg);
        });
        return res.status(400).json({ error: true, errors: errors.array() });
    }

    try {
        const { password, userEmail, userName, description, userBirthDate, locationLat, locationLon, sport, phoneNumber, accountType } = req.body;
        const hashedpwd = await utilFunctions.HashPassword(password);

        const jwtSecretKey = `${process.env.ACCOUNT_SECRET}${hashedpwd}${userEmail}`;
        const userPrivateToken = jwt.sign({}, jwtSecretKey);
        const userPublicToken = jwt.sign({}, `${process.env.ACCOUNT_REGISTER_SECRET}`);

        const connection = await connect(req.pool!);

        if (connection == null) {
            logging.error('REGISTER_USER_FUNC', 'Could not connect to database');
            return { error: true };
        }

        if (await utilFunctions.checkEmailExists(req.pool!, userEmail)) {
            return res.status(400).json({
                error: true,
                errmsg: 'An account with this email already exists',
            });
        }

        const insertUserQuery = `
            INSERT INTO users (UserName, Description, BirthDate, LocationLat, LocationLon, Sport, PhoneNumber, UserEmail, UserPwd, UserVisibility, AccountType, UserPrivateToken, UserPublicToken)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'public', $10, $11, $12)
        `;
        await query(connection, insertUserQuery, [userName, description, userBirthDate, locationLat, locationLon, sport, phoneNumber, userEmail, hashedpwd, accountType, userPrivateToken, userPublicToken]);

        await fs.promises.mkdir(`${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/`, { recursive: true });

        const customer = await req.stripe?.customers.create({
            email: userEmail,
            name: userName,
            metadata: { PublicToken: userPublicToken },
        });

        if (!customer) {
            logging.error('REGISTER_USER_FUNC', 'Stripe customer creation failed');
            return { error: true };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.platform_gmail,
                pass: process.env.platform_gmail_password,
            },
        });

        const mailOptions = {
            from: process.env.platform_gmail,
            to: userEmail,
            subject: 'Welcome to Trainerz App!',
            text: `Hello,

An account with the Username: "${userName}", has been created. Thank you for joining Trainerz app. 
Note that this app is still in development and if you encounter a bug, feel free to report it to us.

Thank you,
Trainerz Team`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logging.error('REGISTER_USER_FUNC', 'Error sending email: ' + error.message);
            } else {
                logging.info('REGISTER_USER_FUNC', 'Email sent successfully: ' + info.response);
            }
        });
        return res.status(200).json({
            error: false,
            userPrivateToken,
            userPublicToken,
            accountType: accountType,
        });
    } catch (error: any) {
        logging.error('REGISTER_USER_FUNC', error.message);
        return res.status(500).json({
            error: true,
            errmsg: error.message,
        });
    }
};

/**
 * Logs the User into account
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const LoginUser = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('LOGiN_USER_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return { error: true };
        }

        const LoginQueryString = `SELECT UserPrivateToken, UserPublicToken, UserPwd, AccountType FROM users WHERE UserEmail='${req.body.userEmail}';`;

        const accountVideosDB = await query(connection, LoginQueryString);

        const data = JSON.parse(JSON.stringify(accountVideosDB));
        if (Object.keys(data).length === 0) {
            return res.status(200).json({
                error: false,
                userPrivateToken: null,
            });
        }

        bcrypt.compare(req.body.password, data[0].userpwd, (err, isMatch) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: true,
                });
            } else if (!isMatch) {
                return res.status(200).json({
                    error: false,
                    userPrivateToken: null,
                });
            } else {
                return res.status(200).json({
                    error: false,
                    userPrivateToken: data[0].userprivatetoken,
                    userPublicToken: data[0].userpublictoken,
                    accountType: data[0].accounttype,
                });
            }
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

/**
 * Deletes The user Account and all the videos with it
 */
const DeleteUserAccount = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('LOGiN_USER_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.userToken);
        if (UserPublicToken == null) {
            return res.status(200).json({
                error: true,
            });
        }
        const connection = await connect(req.pool!);

        if (connection == null) {
            return res.status(500).json({ error: true, message: 'Database connection failed' });
        }

        try {
            const deleteUserAccountQuery = `
                DELETE FROM users WHERE UserPrivateToken = $1;
            `;
            const deleteUserAccountQuery2 = `
                DELETE FROM packages CASCADE WHERE OwnerToken = $1;
            `;
            await query(connection, deleteUserAccountQuery, [req.body.userToken], true);
            await query(connection, deleteUserAccountQuery2, [UserPublicToken]);
        } catch (err) {
            await connection.query('ROLLBACK');
            throw err;
        }

        const userFolderPath = `${process.env.ACCOUNTS_FOLDER_PATH}/${UserPublicToken}/`;

        const itEtxtsist = await fs.statfsSync(userFolderPath);
        if (itEtxtsist) {
            try {
                await utilFunctions.RemoveDirectory(userFolderPath);
                console.log(`Deleted folder: ${UserPublicToken}`);
                return res.status(202).json({ error: false });
            } catch (err) {
                console.error(`Error deleting directory: ${err}`);
                return res.status(202).json({ error: true, message: 'Error deleting directory' });
            }
        }
    } catch (error: any) {
        logging.error('DELETE_USER_ACCOUNT_FUNC', error.message);
        res.status(202).json({ error: true, errmsg: error.message });
    }
};

/**
 * Gets a personal user account data by User Private Token
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const GetUserAccountData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_ACCOUNT_DATA', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return { error: true };
        }

        const GetUserDataQueryString = `SELECT 
            u.UserName, 
            u.Description, 
            u.BirthDate, 
            u.LocationLat, 
            u.LocationLon, 
            u.AccountFolowers, 
            u.Sport, 
            u.UserEmail, 
            u.PhoneNumber, 
            u.UserVisibility, 
            u.AccountType, 
            u.UserPublicToken, 
            r.Rating
        FROM 
            users u
        LEFT JOIN 
            ratings r
        ON 
            u.UserPublicToken = r.UserToken
        WHERE 
            u.UserPrivateToken = '${req.params.accountPrivateToken}';`;

        const data = await query(connection, GetUserDataQueryString);
        if (Object.keys(data).length === 0) {
            return res.status(200).json({
                error: false,
                userData: null,
            });
        }

        return res.status(200).json({
            error: false,
            userData: data[0],
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

/**
 * Checks if the account owner is valid for the given private token.
 *
 * @param {CustomRequest} req - The custom request object containing the account private token.
 * @param {Response} res - The response object to send the result.
 * @return {Response} A JSON response with the user data if the account owner is valid, or an error if the account owner is not valid or an error occurs.
 */
const CheckAccountOwner = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('CHECK_ACCOUNT_OWNER', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return { error: true };
        }

        const GetUserDataQueryString = `SELECT UserPublicToken FROM users WHERE UserPrivateToken = '${req.body.accountPrivateToken}' AND UserPublicToken='${req.body.accountPublicToken}';`;

        const data = await query(connection, GetUserDataQueryString);
        if (Object.keys(data).length === 0) {
            return res.status(200).json({
                error: false,
                isOwner: false,
            });
        }

        if (data[0].userpublictoken == req.body.profilePublicToken) {
            return res.status(200).json({
                error: false,
                isOwner: true,
            });
        }

        return res.status(200).json({
            error: false,
            isOwner: false,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

/**
 * Change  users data
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const ChangeUserData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('CHANGE_ACCOUNT_DATA_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return { error: true };
        }

        const changeUserDataSQL = `UPDATE users SET 
        UserName='${req.body.userName}', 
        Description='${req.body.userDescription}',
        UserEmail='${req.body.userEmail}', 
        Sport='${req.body.sport}',
        AccountType='${req.body.accountType}',
        userVisibility='${req.body.userVisibility}' WHERE UserPrivateToken='${req.body.userPrivateToken}';`;
        await query(connection, changeUserDataSQL);

        const searchServerResp = await axios.post(`${process.env.SEARCH_SERVER}/update-indexed-user`, {
            UserName: req.body.userName,
            UserPrivateToken: req.body.userPrivateToken,
            Sport: req.body.sport,
            AccountType: req.body.accountType,
        });

        if (searchServerResp.data.error === true) {
            return res.status(202).json({
                error: true,
            });
        }

        return res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

const PhotoUploader = multer({
    storage: storage,
    fileFilter: fileFilter,
}).single('photo');

const ChangeUserIcon = async (req: CustomRequest, res: Response) => {
    PhotoUploader(req, res, async (err: any) => {
        if (err) {
            return res.status(200).json({
                msg: 'falied to upload',
                error: true,
            });
        }

        const userPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);
        if (userPublicToken == null) {
            return res.status(200).json({
                error: true,
            });
        }

        //* Directory Created Succesfully
        fs.rename(`${process.env.ACCOUNTS_FOLDER_PATH}/PhotosTmp/${req.file?.originalname}`, `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/Main_Icon.png`, async (err) => {
            if (err) {
                logging.error(NAMESPACE, err.message);

                return res.status(200).json({
                    error: true,
                });
            }

            return res.status(200).json({
                error: false,
            });
        });
    });
};

export default {
    RegisterUser,
    LoginUser,
    GetUserAccountData,
    ChangeUserData,
    CheckAccountOwner,
    ChangeUserIcon,
    DeleteUserAccount,
};
