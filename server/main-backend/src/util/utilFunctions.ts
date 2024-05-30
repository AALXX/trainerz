import bcrypt from 'bcrypt';
import logging from '../config/logging';
import { connect, query } from '../config/postgresql';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import utilFunctions from '../util/utilFunctions';
import path from 'path';
import { Pool } from 'pg';

//* /////////////////////////////
//*      Account related       //
//* /////////////////////////////

/**
 ** Hash the password inputed by user
 * @param {string} password
 */
const HashPassword = async (password: string) => {
    const NAMESPACE = 'HASH_PASSWORD_FUNCTION';

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(11);

        // Hash password
        return await bcrypt.hash(password, salt);
    } catch (error) {
        logging.error(NAMESPACE, error as string);
    }

    // Return null if error
    return null;
};

/**
 * Checks if a given email address exists in the users table.
 *
 * @param {Pool} pool - The database connection pool.
 * @param {string} userEmail - The email address to check.
 * @return {boolean} `true` if the email address exists, `false` otherwise.
 */
const checkEmailExists = async (pool: Pool, userEmail: string): Promise<boolean> => {
    const NAMESPACE = 'CHECK_EMAIL_EXISTS_FUNC';
    const QueryString = `SELECT 1 FROM users WHERE UserEmail = $1 LIMIT 1;`;

    try {
        if (userEmail === 'undefined' || userEmail === '') {
            return false;
        }

        const connection = await connect(pool);

        if (connection == null) {
            return false;
        }

        const Response = await query(connection, QueryString, [userEmail]);
        const userData = JSON.parse(JSON.stringify(Response));

        if (userData.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return false;
    }
};

/**
 * Retrieves the user's private token from their public token.
 *
 * @param {Pool} pool - The database connection pool.
 * @param {string} userToken - The user's public token.
 * @return {string} The user's private token, or `null` if not found or an error occurred.
 */
const getUserPrivateTokenFromPublicToken = async (pool: Pool, userToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_PRIVATE_TOKEN_FUNC';
    const QueryString = `SELECT UserPrivateToken FROM users WHERE UserPublicToken='${userToken}';`;

    try {
        if (userToken === 'undefined') {
            return null;
        }
        const connection = await connect(pool);

        if (connection == null) {
            return null;
        }

        const Response = await query(connection, QueryString);
        const userData = JSON.parse(JSON.stringify(Response));
        if (Object.keys(userData).length != 0) {
            return userData[0].UserPrivateToken;
        } else {
            return null;
        }
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return null;
    }
};

const getUserEmailFromPrivateToken = async (pool: Pool, userPrivateToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_EMAIL_FUNC';
    const QueryString = `SELECT UserEmail FROM users WHERE UserPrivateToken='${userPrivateToken}';`;

    try {
        if (userPrivateToken === 'undefined') {
            return null;
        }
        const connection = await connect(pool);

        if (connection == null) {
            return null;
        }

        const userData = await query(connection!, QueryString);
        if (Object.keys(userData).length != 0) {
            return userData[0].UserEmail;
        } else {
            return null;
        }
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return null;
    }
};

const getUserPublicTokenFromPrivateToken = async (pool: Pool, userPrivateToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_PRIVATE_TOKEN_FUNC';
    const QueryString = `SELECT UserPublicToken FROM users WHERE UserPrivateToken='${userPrivateToken}';`;

    try {
        if (userPrivateToken === 'undefined') {
            return null;
        }
        const connection = await connect(pool);

        if (connection == null) {
            return null;
        }

        const resp = await query(connection, QueryString);
        if (Object.keys(resp).length != 0) {
            return resp[0].userpublictoken;
        } else {
            return null;
        }
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return null;
    }
};

const getUserRole = async (pool: Pool, userToken: string, chanelPublicToken: string): Promise<number | null> => {
    const NAMESPACE = 'GET_USER_ROLE_FUNCTION';
    const QueryString = `SELECT RoleCategoryId FROM channel_roles_alloc WHERE UserPrivateToken='${userToken}' AND ChannelToken='${chanelPublicToken}';`;

    try {
        if (userToken === 'undefined') {
            return null;
        }

        const connection = await connect(pool);

        if (connection == null) {
            return null;
        }
        const data = await query(connection, QueryString);
        if (Object.keys(data).length === 0) {
            return null;
        }
        return data[0].RoleCategoryId;
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return null;
    }
};

const checkIfUserIsBlocked = async (pool: Pool, userPrivateToken: string, chanelPublicToken: string): Promise<{ isBanned: boolean; reason?: string }> => {
    const NAMESPACE = 'CHECK_USER_BAN_FUNCTION';
    const QueryString = `SELECT * FROM blocked_list WHERE UserToken='${userPrivateToken}' AND CreatorToken='${chanelPublicToken}';`;
    try {
        if (userPrivateToken === 'undefined') {
            return {
                isBanned: false,
            };
        }
        const connection = await connect(pool);

        if (connection == null) {
            return {
                isBanned: false,
            };
        }
        const data = await query(connection, QueryString);
        if (Object.keys(data).length === 0) {
            return {
                isBanned: false,
            };
        }

        return {
            isBanned: true,
            reason: data[0].Reason,
        };
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return {
            isBanned: false,
        };
    }
};

const userFollowAccountCheck = async (pool: Pool, userToken: string, accountPublicToken: string): Promise<boolean> => {
    const NAMESPACE = 'USER_FOLLOW_CHECK_FUNCTION';
    const QueryString = `SELECT * FROM user_follw_account_class WHERE userToken='${userToken}' AND accountToken='${accountPublicToken}';`;

    try {
        if (userToken === 'undefined') {
            return false;
        }
        const connection = await connect(pool);

        if (connection == null) {
            return false;
        }
        const checkfollowResponse = await query(connection, QueryString);
        const data = JSON.parse(JSON.stringify(checkfollowResponse));
        if (Object.keys(data).length != 0) {
            return true;
        } else {
            return false;
        }
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return false;
    }
};

//* /////////////////////////////
//*      Videos related        //
//* /////////////////////////////

/**
 ** creates video token
 * @return {string}
 */
const CreateVideoToken = (): string => {
    const secretExt = new Date().getTime().toString();

    const jwtSecretKey = `${process.env.ACCOUNT_SECRET}` + secretExt;

    const userprivateToken = jwt.sign({}, jwtSecretKey);

    return userprivateToken;
};

const getUserLikedOrDislikedVideo = async (pool: Pool, userToken: string, VideoToken: string): Promise<{ userLiked: boolean; like_or_dislike: number }> => {
    const NAMESPACE = 'USER_LIKED_OR_DISLIKED_FUNCTION';
    const CheckIfUserFollwsAccountQuerryString = `SELECT * FROM user_liked_or_disliked_video_class WHERE userToken='${userToken} AND videoToken='${VideoToken}';`;

    try {
        if (userToken === 'undefined') {
            return { userLiked: false, like_or_dislike: 0 };
        }

        const connection = await connect(pool);

        if (connection == null) {
            return { userLiked: false, like_or_dislike: 0 };
        }

        const checkfollowdata = await query(connection, CheckIfUserFollwsAccountQuerryString);
        if (Object.keys(checkfollowdata).length != 0) {
            return { userLiked: true, like_or_dislike: checkfollowdata[0].like_dislike };
        }
        return { userLiked: false, like_or_dislike: 0 };
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return { userLiked: false, like_or_dislike: 0 };
    }
};

const getUserLikedOrDislikedStream = async (pool: Pool, userToken: string, StreamToken: string): Promise<{ userLiked: boolean; like_or_dislike: number }> => {
    const NAMESPACE = 'USER_LIKED_OR_DISLIKED_FUNCTION';
    const CheckIfUserFollwsAccountQuerryString = `SELECT * FROM user_liked_or_disliked_stream_class WHERE userToken='${userToken}' AND StreamToken='${StreamToken}';`;

    try {
        if (userToken === 'undefined') {
            return { userLiked: false, like_or_dislike: 0 };
        }
        const connection = await connect(pool);

        if (connection == null) {
            return { userLiked: false, like_or_dislike: 0 };
        }
        const checklikeResponse = await query(connection, CheckIfUserFollwsAccountQuerryString);
        if (Object.keys(checklikeResponse).length != 0) {
            return { userLiked: true, like_or_dislike: checklikeResponse[0].like_dislike };
        }
        return { userLiked: false, like_or_dislike: 0 };
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        return { userLiked: false, like_or_dislike: 0 };
    }
};

const RemoveDirectory = (folderPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            // Iterate over all files and subdirectories
            Promise.all(
                files.map((file) => {
                    const currentPath = path.join(folderPath, file);

                    return new Promise<void>((resolve, reject) => {
                        fs.lstat(currentPath, (err, stats) => {
                            if (err) {
                                return reject(err);
                            }

                            if (stats.isDirectory()) {
                                // Recursively delete subdirectory
                                RemoveDirectory(currentPath).then(resolve).catch(reject);
                            } else {
                                // Delete file
                                fs.unlink(currentPath, (err) => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve();
                                });
                            }
                        });
                    });
                }),
            )
                .then(() => {
                    // Delete the now-empty folder
                    fs.rmdir(folderPath, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                })
                .catch(reject);
        });
    });
};

//* /////////////////////////////
//*        Live related        //
//* /////////////////////////////

const CheckIfLive = async (pool: Pool, userPrivateToken: string, LiveToken: string): Promise<{ isLive: boolean; error: boolean }> => {
    const NAMESPACE = 'CHECK_IF_IS_LIVE_FUNCTION';

    try {
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(pool, userPrivateToken);
        const connection = await connect(pool);

        if (connection == null) {
            return { isLive: false, error: false };
        }

        if (UserPublicToken == null) {
            return { isLive: false, error: true };
        }
        const StatALiveQueryString = `SELECT id, Active FROM streams WHERE UserPublicToken=${UserPublicToken}' AND StreamToken='${LiveToken}';`;

        const results = await query(connection, StatALiveQueryString);
        const data = JSON.parse(JSON.stringify(results));
        if (Object.keys(data).length == 0) {
            return { isLive: false, error: false };
        }

        return { isLive: data[0].Active === 0 ? false : true, error: false };
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);
        return { isLive: false, error: true };
    }
};

// const StartLive = async (pool: mysql.Pool, LiveTitle: string, userPrivateToken: string): Promise<{ error: boolean; LiveToken: string }> => {
//     const NAMESPACE = 'START_LIVE_FUNCTION';

//     try {
//         const StreamToken = CreateVideoToken();
//         const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(pool, userPrivateToken);
//         const connection = await connect(pool);

//         if (connection == null) {
//             return null;
//         }
//         if (UserPublicToken == null) {
//             return { error: true, LiveToken: '' };
//         }
//         const currentTimestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // Get current timestamp in MySQL format
//         const StatALiveQueryString = `INSERT INTO streams(StreamTitle,  UserPublicToken, StartedAt, StreamToken, Active)
//         SELECT "${LiveTitle}", "${UserPublicToken}", "${currentTimestamp}",  "${StreamToken}", "1"
//         FROM users AS u
//         WHERE u.UserPublicToken = "${UserPublicToken}";`;

//         const results = await query(connection, StatALiveQueryString);

//         const resp = await axios.post('http://localhost:7556/start-snapshot', { StreamToken: StreamToken });
//         console.log(resp);

//         const data = JSON.parse(JSON.stringify(results));
//         if (data.affectedRows == 0) {
//             return { error: true, LiveToken: '' };
//         }

//         return { error: false, LiveToken: StreamToken };
//     } catch (error: any) {
//         logging.error(NAMESPACE, error.message);
//         return { error: true, LiveToken: '' };
//     }
// };

// /**
//  * End a live
//  * @param {string} userPrivateToken
//  * @return {}
//  */
// const EndLive = async (pool: mysql.Pool, userPrivateToken: string, streamToken: string): Promise<boolean> => {
//     const NAMESPACE = 'END_LIVE_FUNCTION';

//     try {
//         const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(pool, userPrivateToken);
//         const connection = await connect(pool);

//         if (connection == null) {
//             return null;
//         }
//         if (UserPublicToken == null) {
//             return true;
//         }

//         const currentTimestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // Get current timestamp in MySQL format

//         const StatALiveQueryString = `UPDATE streams SET FinishedAt='${currentTimestamp}', Active='0' WHERE UserPublicToken = "${UserPublicToken}";`;

//         const results = await query(connection, StatALiveQueryString);

//         const data = JSON.parse(JSON.stringify(results));
//         if (data.affectedRows == 0) {
//             return true;
//         }

//         return false;
//     } catch (error: any) {
//         logging.error(NAMESPACE, error.message);
//         return true;
//     }
// };

export default {
    HashPassword,
    checkEmailExists,
    CreateVideoToken,
    getUserRole,
    checkIfUserIsBlocked,
    userFollowAccountCheck,
    getUserEmailFromPrivateToken,
    getUserLikedOrDislikedVideo,
    getUserPublicTokenFromPrivateToken,
    getUserLikedOrDislikedStream,
    getUserPrivateTokenFromPublicToken,
    RemoveDirectory,
    CheckIfLive,
    // StartLive,
    // EndLive,
};
