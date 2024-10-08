import { Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import FFmpeg from 'fluent-ffmpeg';
import logging from '../../config/logging';
import utilFunctions from '../../util/utilFunctions';
import { validationResult } from 'express-validator';
import { connect, CustomRequest, query } from '../../config/postgresql';
import { Pool } from 'pg';

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

        const VideoToken = utilFunctions.CreateToken();

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

                    const success = await SendInitialVideoDataToDb(req.pool!, userPublicToken, VideoToken, req.body.VideoTitle, req.body.PackageToken);
                    if (!success) {
                        return res.status(500).json({ error: true, errormsg: 'Database error' });
                    }

                    const resp = await VideoProceesor(
                        `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}/Original.mp4`,
                        `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/${VideoToken}/Source.mp4`,
                        req.body.width,
                        req.body.height,
                        16,
                    );

                    if (resp.error) {
                        return res.status(500).json({ error: true, errormsg: 'Video Processing error' });
                    }

                    const updateSuccess = await UpdateVideoStatus(req.pool!, VideoToken);
                    if (!updateSuccess) {
                        return res.status(500).json({ error: true, errormsg: 'Database error' });
                    }
                    return res.status(200).json({ error: false });
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
const SendInitialVideoDataToDb = async (pool: Pool, userPublicToken: string, videoToken: string, VideoTitle: string, PackageToken: number) => {
    const today = new Date().toISOString().slice(0, 10);

    const connection = await connect(pool);
    try {
        if (connection == null) {
            connection!.release();
            return false;
        }

        const SendVidsDatasSqlQuery = `INSERT INTO videos (VideoTitle, VideoDescription, PublishDate, VideoToken, OwnerToken, Visibility, Packagetoken, Status)
        VALUES($1, '', $2, $3, $4, 'public', $5, 'processing')`;
        await query(connection, SendVidsDatasSqlQuery, [VideoTitle, today, videoToken, userPublicToken, PackageToken]);
        return true;
    } catch (error) {
        connection?.release();
        return false;
    }
};

const UpdateVideoStatus = async (pool: Pool, videoToken: string) => {
    const connection = await connect(pool);
    try {
        if (connection == null) {
            connection!.release();
            return false;
        }

        const SendVidsDatasSqlQuery = `UPDATE videos SET Status='ready' WHERE VideoToken = $1`;
        await query(connection, SendVidsDatasSqlQuery, [videoToken]);
        return true;
    } catch (error) {
        connection?.release();
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
const VideoProceesor = async (srcPath: string, dstPath: string, width: number, height: number, numThreads: number): Promise<{ error: boolean }> =>
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
    const GetVideoDataQueryString = `SELECT v.VideoTitle, v.OwnerToken, v.likes, v.dislikes, v.PublishDate, v.VideoToken, v.Visibility, v.Packagetoken, v.Views, v.Status, u.UserName as OwnerName, p.PackageSport
    FROM videos AS v
    JOIN users AS u ON v.OwnerToken = u.UserPublicToken
    LEFT JOIN packages AS p ON v.PackageToken = p.PackageToken
    WHERE v.OwnerToken = $1;`;

    const connection = await connect(req.pool!);
    try {
        if (connection == null) {
            return false;
        }

        const VideosData = await query(connection, GetVideoDataQueryString, [req.params.UserPublicToken]);
        return res.status(202).json({
            error: false,
            VideosData: VideosData,
        });
    } catch (error: any) {
        connection?.release();
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

    const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);

    const GetVideoDataQueryString = `SELECT 
        v.VideoTitle, 
        v.OwnerToken, 
        v.Likes, 
        v.Dislikes, 
        v.PublishDate, 
        v.Visibility, 
        v.Views, 
        v.packagetoken
    FROM 
        videos v
    WHERE 
        v.VideoToken = $1 
    AND 
        v.OwnerToken = $2;`;
    const connection = await connect(req.pool!);
    try {
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
            PackageToken: Videodata[0].packagetoken,
            // ShowLikesDislikes: Videodata[0].ShowLikesDislikes === 0 ? false : Videodata[0].ShowLikesDislikes === 1 ? true : undefined,
            // AvrageWatchTime: Videodata[0].AvrageWatchTime,
            Views: Videodata[0].views,
        });
    } catch (error: any) {
        connection?.release();
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
    const connection = await connect(req.pool!);
    try {
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);

        if (connection == null) {
            return false;
        }
        // Update videos table
        const updateVideoQuery = `
            UPDATE videos 
            SET 
                VideoTitle = $1, 
                Visibility = $2,
                PackageToken = $3
            WHERE 
                VideoToken = $4 
            AND 
                OwnerToken = $5;
        `;
        await query(connection, updateVideoQuery, [req.body.VideoTitle, req.body.VideoVisibility, req.body.PackageToken, req.body.VideoToken, UserPublicToken]);

        res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);
        connection?.release();
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
