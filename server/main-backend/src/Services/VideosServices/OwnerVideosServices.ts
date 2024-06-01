import { Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import FFmpeg from 'fluent-ffmpeg';
import logging from '../../config/logging';
import UtilFunc from '../../util/utilFunctions';
import utilFunctions from '../../util/utilFunctions';
import { validationResult } from 'express-validator';
import { connect, CustomRequest, query } from '../../config/postgresql';

const NAMESPACE = 'AccountUploadServiceManager';

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
        callback(null, `${process.env.ACCOUNTS_FOLDER_PATH}/VideosTmp`);
    },
    filename: (req: CustomRequest, file, cb: any) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req: CustomRequest, file: any, cb: any) => {
    if (file.mimetype === 'video/mp4' || 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const videoUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
}).fields([
    {
        name: 'VideoFile',
        maxCount: 1,
    },
    {
        name: 'VideoThumbnail',
        maxCount: 1,
    },
]);

/**
 * Uploads video file to video server
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const UploadVideoFileToServer = async (req: CustomRequest, res: Response) => {
    logging.info(NAMESPACE, 'Posting Video service called');

    videoUpload(req, res, async (err: any) => {
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

        const VideoToken = UtilFunc.CreateVideoToken();

        fs.mkdir(`${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}`, (err) => {
            if (err) {
                logging.error(NAMESPACE, err.message);
                return res.status(500).json({ error: true, errormsg: 'Directory creation error' });
            }

            const videoFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['VideoFile']?.[0];
            const videoThumbnail = (req.files as { [fieldname: string]: Express.Multer.File[] })['VideoThumbnail']?.[0];

            if (!videoFile) {
                return res.status(400).json({ error: true, errormsg: 'Video file or thumbnail not provided' });
            }

            fs.rename(`${process.env.ACCOUNTS_FOLDER_PATH}/VideosTmp/${videoFile.originalname}`, `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}/Original.mp4`, async (err) => {
                if (err) {
                    logging.error(NAMESPACE, err.message);
                    return res.status(500).json({ error: true, errormsg: 'File renaming error' });
                }
                fs.rename(`${process.env.ACCOUNTS_FOLDER_PATH}/VideosTmp/${videoThumbnail.originalname}`, `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}/Thumbnail_image.jpg`, async (err) => {
                    if (err) {
                        logging.error(NAMESPACE, err.message);
                        return res.status(500).json({ error: true, errormsg: 'File renaming error' });
                    }

                    await VideoProceesor(
                        `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}/Original.mp4`,
                        `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}/Source.mp4`,
                        req.body.width,
                        req.body.height,
                        16,
                    );

                    const success = await SendVideoDataToDb(req, userPublicToken, VideoToken, req.body.VideoTitle, req.body.VideoVisibility, req.body.Price);
                    if (!success) {
                        return res.status(500).json({ error: true, errormsg: 'Database error' });
                    }

                    try {
                        const categorySuccess = await SendVideoCategoryToDb(req, VideoToken, req.body.VideoSport);
                        if (!categorySuccess) {
                            return res.status(500).json({ error: true, errormsg: 'Database error' });
                        }

                        return res.status(200).json({ error: false });
                    } catch (error) {
                        return res.status(500).json({ error: true, errormsg: 'Database error' });
                    }
                });
            });
        });
    });
};

/**
 * Asynchronously sends video data to the database.
 * @param {CustomRequest} req - The custom request object.
 * @param {string} userPublicToken - The public token of the user.
 * @param {string} videoToken - The token of the video.
 * @param {string} VideoTitle - The title of the video.
 * @param {string} VideoVisibility - The visibility of the video.
 * @param {number} price - The price of the video.
 * @return {boolean}  `true` if the video data was successfully sent to the database, `false` otherwise.
 */
const SendVideoDataToDb = async (req: CustomRequest, userPublicToken: string, videoToken: string, VideoTitle: string, VideoVisibility: string, price: number) => {
    const today = new Date().toISOString().slice(0, 10);

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const SendVidsDatasSqlQuery = `INSERT INTO videos (VideoTitle, VideoDescription, PublishDate, VideoToken, OwnerToken, Visibility, BasePrice)
        VALUES('${VideoTitle}', '', '${today}', '${videoToken}', '${userPublicToken}', '${VideoVisibility}', ${price})`;
        await query(connection, SendVidsDatasSqlQuery);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Sends the category ID for a video to the database.
 * @param {CustomRequest} req - The custom request object.
 * @param {string} videoToken - The token of the video.
 * @param {string} SportName - The ID of the category.
 * @return {Promise<boolean>} - Returns true if the video category was successfully sent to the database, false otherwise.
 */
const SendVideoCategoryToDb = async (req: CustomRequest, videoToken: string, SportName: string) => {
    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const sendVideoCategoryToDbSQl = `INSERT INTO videos_category_alloc (videoToken, SportName) VALUES ('${videoToken}','${SportName}')`;
        const accData = await query(connection, sendVideoCategoryToDbSQl);

        if (Object.keys(accData).length === 0) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Processes and makes all thumbnails 626x325
 * @param {string} path
 */
const ThumbnailProceesor = async (path: string) =>
    new Promise((resolve, reject) => {
        try {
            FFmpeg(path)
                .size('626x352')
                .on('end', () => {
                    resolve({ error: false });
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    reject(err);
                })
                .save(path)
                .run();
        } catch {}
    });

/**
 * Processes a video file by transcoding it to a specified resolution and format.
 * @param {string} srcPath - The path to the source video file.
 * @param {string} dstPath - The path to the destination video file.
 * @param {number} width - The desired width of the output video.
 * @param {number} height - The desired height of the output video.
 * @param {number} numThreads - The number of threads to use for the transcoding process.
 * @return {void} A Promise that resolves with an object containing an 'error' property indicating whether the operation was successful.
 */
const VideoProceesor = async (srcPath: string, dstPath: string, width: number, height: number, numThreads: number) =>
    new Promise((resolve, reject) => {
        const ffprobe = FFmpeg.ffprobe;

        ffprobe(srcPath, (err, metadata) => {
            if (err) {
                logging.error('FFprobe Error:', err);
                reject(err);
                return;
            }

            let videoSize = '';
            if (width > height) {
                videoSize = '1920x1080';
            } else {
                videoSize = '1920x1080';
            }

            FFmpeg(srcPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .addOption('-threads', numThreads.toString())
                .on('progress', (progress) => {
                    console.log('Processing: ' + progress.timemark);
                })
                .size(videoSize)
                .on('error', (err) => {
                    logging.error('FFmpeg Error:', err);
                    reject(err);
                })
                .save(dstPath)
                .on('end', () => {
                    resolve({ error: false });
                });
        });
    });

/**
 * Retrieves the list of videos owned by the user with the specified public token.
 *
 * @param {CustomRequest} req - The HTTP request object, containing the user's public token in the `req.params.UserPublicToken` property.
 * @param {Response} res - The HTTP response object, which will be used to send the video data back to the client.
 */
const GetAccountVideos = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_ACCOUNT_VIDEO_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }
    const GetVideoDataQueryString = `SELECT v.VideoTitle, v.OwnerToken, v.likes, v.dislikes, v.PublishDate, v.VideoPrice, v.VideoToken, v.Visibility, v.Views, u.UserName as OwnerName, a.SportName
    FROM videos AS v
    JOIN users AS u ON v.OwnerToken = u.UserPublicToken
    LEFT JOIN videos_category_alloc AS a ON v.VideoToken = a.VideoToken
    WHERE v.OwnerToken = '${req.params.UserPublicToken}';`;

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const VideosData = await query(connection, GetVideoDataQueryString);
        return res.status(202).json({
            error: false,
            VideosData: VideosData,
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
 * get creator video data
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const GetCreatorVideoData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_CREATOR_VIDEO_DATA_BY_TOKEN_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const UserPublicToken = await UtilFunc.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);

    const GetVideoDataQueryString = `SELECT 
        v.VideoTitle, 
        v.OwnerToken, 
        v.Likes, 
        v.Dislikes, 
        v.PublishDate, 
        v.Visibility, 
        v.VideoPrice, 
        v.Views, 
        vc.SportName
    FROM 
        videos v
    LEFT JOIN 
        videos_category_alloc vc
    ON 
        v.VideoToken = vc.VideoToken
    WHERE 
        v.VideoToken = $1 
    AND 
        v.OwnerToken = $2;`;
    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }
        const Videodata = await query(connection, GetVideoDataQueryString, [req.params.VideoToken, UserPublicToken]);

        if (Object.keys(Videodata).length === 0) {
            return res.status(202).json({
                error: true,
            });
        }

        return res.status(202).json({
            error: false,
            VideoTitle: Videodata[0].videotitle,
            PublishDate: Videodata[0].ownertoken,
            VideoVisibility: Videodata[0].visibility,
            VideoLikes: Videodata[0].likes,
            VideoDislikes: Videodata[0].dislikes,
            OwnerToken: Videodata[0].ownertoken,
            VideoPrice: Videodata[0].videoprice,
            Sport: Videodata[0].sportname,
            // ShowLikesDislikes: Videodata[0].ShowLikesDislikes === 0 ? false : Videodata[0].ShowLikesDislikes === 1 ? true : undefined,
            // AvrageWatchTime: Videodata[0].AvrageWatchTime,
            Views: Videodata[0].views,
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
 * update creator video data
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const UpdateCreatorVideoData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_CREATOR_VIDEO_DATA_BY_TOKEN_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }
    try {
        const UserPublicToken = await UtilFunc.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);

        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }
        // Update videos table
        const updateVideoQuery = `
            UPDATE videos 
            SET 
                VideoTitle = $1, 
                Visibility = $2 
            WHERE 
                VideoToken = $3 
            AND 
                OwnerToken = $4;
        `;
        await query(connection, updateVideoQuery, [req.body.VideoTitle, req.body.VideoVisibility, req.body.VideoToken, UserPublicToken], true);

        // Update videos_category_alloc table
        const updateCategoryQuery = `
            UPDATE videos_category_alloc 
            SET 
                SportName = $1 
            WHERE 
                VideoToken = $2;
        `;
        await query(connection, updateCategoryQuery, [req.body.Sport, req.body.VideoToken]);

        res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        return res.status(500).json({
            message: error.message,
            error: true,
        });
    }
};

export default {
    UploadVideoFileToServer,
    GetAccountVideos,
    GetCreatorVideoData,
    UpdateCreatorVideoData,
};
