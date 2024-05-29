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
    if (file.mimetype === 'image/jpeg') {
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
        errors.array().map((error) => {
            logging.error('REGISTER_USER_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const hashedpwd = await utilFunctions.HashPassword(req.body.password);

    const jwtSecretKey = `${process.env.ACCOUNT_SECRET}` + hashedpwd + req.body.userEmail;
    const privateData = {};

    const publicData = {};

    const userPrivateToken = jwt.sign(privateData, jwtSecretKey);

    const userPublicToken = jwt.sign(publicData, `${process.env.ACCOUNT_REGISTER_SECRET}`);
    const InsertUserQueryString = `
    INSERT INTO users (UserName, Description, BirthDate, LocationLat, LocationLon, Sport, PhoneNumber, UserEmail, UserPwd, UserVisibility, AccountType, AccountPrice, UserPrivateToken, UserPublicToken)
    VALUES('${req.body.userName}', '${req.body.description}', 
    '${req.body.userBirthDate}', '${req.body.locationLat}', 
    '${req.body.locationLon}', '${req.body.sport}', '${req.body.phoneNumber}', '${req.body.userEmail}', '${hashedpwd}', 'public', '${req.body.accountType}',
    '${req.body.accountPrice}',  '${userPrivateToken}', '${userPublicToken}');`;

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return res.status(500).json({
                message: 'connection issue with db',
                error: true,
            });
        }

        if (await utilFunctions.checkEmailExists(req.pool!, req.body.userEmail)) {
            return res.status(202).json({
                error: true,
                erromsg: 'ann account with this email already exists',
            });
        }

        await query(connection, InsertUserQueryString);
        fs.mkdir(`${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/`, async (err) => {
            if (err) {
                return res.status(200).json({
                    error: true,
                });
            }

            // if (req.body.accountType === 'Trainer') {
            //     const product = await req.stripe?.products.create({ name: req.body.userName, metadata: { PublicToken: userPublicToken } });
            //     if (product!.id != null) {
            //         await req.stripe?.prices.create({
            //             product: product!.id,
            //             unit_amount: req.body.accountPrice * 100, // Amount in cents (e.g., $15.00)
            //             currency: 'usd',
            //             recurring: {
            //                 interval: 'month',
            //             },
            //         });
            //     }
            // }
            // await req.stripe?.customers.create({
            //     email: req.body.userEmail,
            //     name: req.body.userName,
            // });

            const resp = await axios.post(`${process.env.SEARCH_SERVER}/index-user`, {
                UserName: req.body.userName,
                UserPrivateToken: userPrivateToken,
                AccountType: req.body.accountType,
                Sport: req.body.sport,
            });

            if (resp.data.error == true) {
                logging.error('REGISTER_USER_FUNC', 'failed to index user');
            }

            // Create a transporter with Gmail SMTP configuration
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.platform_gmail,
                    pass: process.env.platform_gmail_password,
                },
            });

            const mailOptions = {
                from: process.env.platform_gmail,
                to: req.body.userEmail,
                subject: 'Welcome to Trainerz App!',
                text: `Hello,

An account with the Username: "${req.body.userName}", has been created. Thank you for joining Trainerz app. 
Note that this app is still in development and if you encounter a bug, feel free to report it to us.

Thank you,
Trainerz Team`,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Error sending email');
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).send('Email sent successfully');
                }
            });

            return res.status(202).json({
                error: false,
                userprivateToken: userPrivateToken,
                userpublictoken: userPublicToken,
            });
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        return res.status(500).json({
            message: error.message,
            error: true,
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

        const LoginQueryString = `SELECT UserPrivateToken, UserPublicToken, UserPwd FROM users WHERE UserEmail='${req.body.userEmail}';`;

        const accountVideosDB = await query(connection, LoginQueryString);

        const data = JSON.parse(JSON.stringify(accountVideosDB));
        if (Object.keys(data).length === 0) {
            return res.status(200).json({
                error: false,
                userprivateToken: null,
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
                    userprivateToken: null,
                });
            } else {
                return res.status(200).json({
                    error: false,
                    userprivateToken: data[0].userprivatetoken,
                    userpublicToken: data[0].userpublictoken,
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
            u.AccountPrice, 
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

        return res.status(200).json({
            error: false,
            isOwner: true,
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
        AccountPrice='${req.body.price}',
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

export default {
    RegisterUser,
    LoginUser,
    GetUserAccountData,
    ChangeUserData,
    CheckAccountOwner,
};
