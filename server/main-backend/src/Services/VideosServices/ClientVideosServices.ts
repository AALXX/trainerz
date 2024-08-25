import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import UtilFunc from '../../util/utilFunctions';
import utilFunctions from '../../util/utilFunctions';

const NAMESPACE = 'ClientVideosServiceManager';

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
 *Gets Data About Video from db
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const GetVideoDataByToken = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_VIDEO_DATA_BY_TOKEN_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        if (connection == null) {
            return false;
        }

        const queryString = `
      SELECT 
        v.VideoTitle, 
        v.VideoDescription, 
        v.Likes, 
        v.Dislikes, 
        v.PublishDate, 
        v.OwnerToken,
        u.UserName AS AccountName, 
        p.PackageName, 
        p.Rating
      FROM 
        videos v
      INNER JOIN 
        users u 
        ON v.OwnerToken = u.UserPublicToken
      LEFT JOIN 
        packages p 
        ON v.PackageToken = p.PackageToken
      WHERE 
        v.VideoToken = $1;
    `;

        const result = await query(connection, queryString, [req.params.VideoToken]);

        if (result.length === 0) {
            return res.status(202).json({ error: false });
        }

        const Videodata = JSON.parse(JSON.stringify(result));

        const getuserlikedordislike = await UtilFunc.getUserLikedOrDislikedVideo(req.pool!, req.params.UserPrivateToken, req.params.VideoToken);

        res.status(202).json({
            error: false,
            ...Videodata[0], // Spread the video data
            UserLikedOrDislikedVideo: getuserlikedordislike,
        });
    } catch (error: any) {
        connection?.release();
        logging.error(NAMESPACE, error.message, error);

        return res.status(500).json({
            message: error.message,
            error: true,
        });
    }
};

/**
 * Like the video by token
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const LikeDislikeVideoFunc = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('LIKE_OR_DISLIKE_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        const getuserlikedordisliked = await UtilFunc.getUserLikedOrDislikedVideo(req.pool!, req.body.UserPublicToken, req.body.videoToken);
        if (getuserlikedordisliked.userLiked) {
            if (req.body.likeOrDislike === 0) {
                if (connection == null) {
                    return res.status(500).json({
                        error: true,
                        message: 'could not connect to database',
                    });
                }
                const deleteSql = `
                    DELETE FROM user_liked_or_disliked_video_class
                    WHERE userToken = $1 AND videoToken = $2;
                `;
                await query(connection, deleteSql, [req.body.UserPublicToken, req.body.videoToken], true);

                const updateSql = `
                    UPDATE videos
                    SET
                        Likes = Likes - CASE WHEN $1 = 1 THEN 1 ELSE 0 END,
                        Dislikes = Dislikes - CASE WHEN $1 = 2 THEN 1 ELSE 0 END
                    WHERE VideoToken = $2;
                `;
                await query(connection, updateSql, [getuserlikedordisliked.like_or_dislike, req.body.videoToken]);
            } else {
                if (connection == null) {
                    return res.status(500).json({
                        error: true,
                        message: 'could not connect to database',
                    });
                }
                const updateUserPreferenceSql = `
                    UPDATE user_liked_or_disliked_video_class
                    SET like_dislike = $1
                    WHERE userToken = $2 AND videoToken = $3;
                `;
                await query(connection, updateUserPreferenceSql, [req.body.likeOrDislike, req.body.UserPublicToken, req.body.videoToken], true);

                const updateVideoLikesSql = `
                    UPDATE videos
                    SET
                        Likes = Likes + CASE WHEN $1 = 1 THEN 1 ELSE -1 END,
                        Dislikes = Dislikes + CASE WHEN $1 = 2 THEN 1 ELSE -1 END
                    WHERE VideoToken = $2;
                `;
                await query(connection, updateVideoLikesSql, [req.body.likeOrDislike, req.body.videoToken]);
            }
        } else {
            if (connection == null) {
                return res.status(500).json({
                    error: true,
                    message: 'could not connect to database',
                });
            }
            const insertUserPreferenceSql = `
                INSERT INTO user_liked_or_disliked_video_class (userToken, videoToken, like_dislike)
                VALUES ($1, $2, $3)
                ON CONFLICT (userToken, videoToken)
                DO UPDATE SET like_dislike = EXCLUDED.like_dislike;
            `;
            await query(connection, insertUserPreferenceSql, [req.body.UserPublicToken, req.body.videoToken, req.body.likeOrDislike], true);

            const updateVideoLikesSql = `
                UPDATE videos
                SET 
                    Likes = Likes + CASE WHEN $1 = 1 THEN 1 ELSE 0 END,
                    Dislikes = Dislikes + CASE WHEN $1 = 2 THEN 1 ELSE 0 END
                WHERE VideoToken = $2;
            `;
            await query(connection, updateVideoLikesSql, [req.body.likeOrDislike, req.body.videoToken]);
        }

        return res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        connection?.release();
        logging.error(NAMESPACE, error.message, error);

        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const SubscribtionCheck = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('LIKE_OR_DISLIKE_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    if (connection == null) {
        return res.status(500).json({
            error: true,
            message: 'could not connect to database',
        });
    }

    try {
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);
        if (UserPublicToken == null) {
            connection!.release();
            return res.status(200).json({
                error: true,
            });
        }

        const OwnerQueryString = `SELECT ownertoken FROM videos WHERE videotoken = $1;`;
        const ownerResp = await query(connection, OwnerQueryString, [req.params.VideoToken], true);

        if (Object.keys(ownerResp).length >= 0 && ownerResp[0].ownertoken === UserPublicToken) {
            connection.release();

            return res.status(202).json({
                error: false,
                subscribed: true,
            });
        }

        const QueryString = `SELECT s.UserpublicToken, s.Tier, s.PackageToken
FROM subscriptions s
JOIN videos v ON s.PackageToken = v.PackageToken
WHERE v.VideoToken = $1 AND s.userpublictoken = $2;`;
        const resp = await query(connection, QueryString, [req.params.VideoToken, UserPublicToken], true);

        if (resp.length == 0) {
            connection.release();
            return res.status(202).json({
                error: false,
                subscribed: false,
            });
        }

        const GetVideoAccesQuery = `SELECT acces_videos FROM ${resp[0].tier} WHERE PackageToken = $1; `;

        const videoAccessData = await query(connection, GetVideoAccesQuery, [resp[0].packagetoken]);
        if (videoAccessData.length == 0) {
            return res.status(202).json({
                error: false,
                subscribed: false,
            });
        }

        if (videoAccessData[0].acces_videos === true) {
            return res.status(202).json({
                error: false,
                subscribed: true,
            });
        } else {
            return res.status(202).json({
                error: false,
                subscribed: false,
            });
        }
    } catch (error: any) {
        connection?.release();
        logging.error(NAMESPACE, error.message, error);

        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

export default { GetVideoDataByToken, LikeDislikeVideoFunc, SubscribtionCheck };
