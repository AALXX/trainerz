import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import UtilFunc from '../../util/utilFunctions';
import utilFunctions from '../../util/utilFunctions';
import axios from 'axios';

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

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const queryString = `
            SELECT v.VideoTitle, v.VideoDescription, v.Likes, v.Dislikes, v.PublishDate, v.OwnerToken,
                   u.UserName AS AccountName, u.AccountFolowers
            FROM videos v
            INNER JOIN users u ON v.OwnerToken = u.UserPublicToken
            WHERE v.VideoToken='${req.params.VideoToken}';
        `;

        const result = await query(connection, queryString);

        if (result.length === 0) {
            return res.status(202).json({ error: false });
        }

        const Videodata = JSON.parse(JSON.stringify(result));

        const UserPublicToken = await UtilFunc.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);
        const itFollows = await UtilFunc.userFollowAccountCheck(req.pool!, UserPublicToken as string, Videodata[0].OwnerToken);
        const getuserlikedordislike = await UtilFunc.getUserLikedOrDislikedVideo(req.pool!, req.params.UserPrivateToken, req.params.VideoToken);

        res.status(202).json({
            error: false,
            ...Videodata[0], // Spread the video data
            UserFollwsAccount: itFollows,
            UserLikedOrDislikedVideo: getuserlikedordislike,
        });
    } catch (error: any) {
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

    const getuserlikedordisliked = await UtilFunc.getUserLikedOrDislikedVideo(req.pool!, req.body.UserPublicToken, req.body.videoToken);

    try {
        if (getuserlikedordisliked.userLiked) {
            if (req.body.likeOrDislike === 0) {
                const connection = await connect(req.pool!);

                if (connection == null) {
                    return false;
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
                const connection = await connect(req.pool!);

                if (connection == null) {
                    return false;
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
            const connection = await connect(req.pool!);

            if (connection == null) {
                return false;
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

        res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);

        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

export default { GetVideoDataByToken, LikeDislikeVideoFunc };
