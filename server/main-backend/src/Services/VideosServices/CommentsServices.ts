import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import utilFunctions from '../../util/utilFunctions';

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

interface IVideoCommentsToBeSendType {
    id: number;
    ownerToken: string;
    videoToken: string;
    comment: string;
    ownerName: string;
}

/**
 * post comment to a video
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const PostCommentToVideo = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('POST_COMMENT_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        if (connection == null) {
            return false;
        }

        const ownerToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);
        if (ownerToken == null) {
            connection?.release();

            return res.status(200).json({
                error: true,
            });
        }

        const PostCommentSQL = `INSERT INTO comments (ownerToken, videoToken, comment) VALUES ($1, $2, $3);`;
        await query(connection, PostCommentSQL, [ownerToken, req.body.VideoToken, req.body.Comment], true);

        const GetUserNameSQL = `SELECT UserName FROM users WHERE userpublictoken = '${ownerToken}';`;
        const resp = await query(connection, GetUserNameSQL);

        console.log(resp[0].username);
        return res.status(202).json({
            error: false,
            userName: resp[0].username,
        });
    } catch (error: any) {
        connection?.release();
        logging.error('POST_COMMENT_FUNC', error.message);
        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

/**
 * delete comment to a video
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const DeleteComment = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('DELETE_COMMENT_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);

    if (connection == null) {
        return false;
    }

    try {
        const ownerToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);

        if (ownerToken == null) {
            connection?.release();
            return res.status(200).json({
                error: true,
            });
        }

        const PostCommentSQL = `DELETE FROM comments WHERE ownerToken='${ownerToken}' AND videoToken='${req.body.VideoToken}' AND id='${req.body.CommentID}'`;
        await query(connection, PostCommentSQL);
        return res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        connection?.release();
        logging.error('DELETE_COMMENT_FUNC', error.msg);
        res.status(202).json({
            error: true,
            errmsg: error.msg,
        });
    }
};

/**
 * get comment from a video
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const GetVideoComments = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_COMMENT_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        if (connection == null) {
            return false;
        }

        const GetVideoCommentsSQL = `
            SELECT 
                c.id, 
                c.ownertoken, 
                c.videotoken, 
                c.comment, 
                u.UserName AS ownerName
            FROM 
                comments c
            JOIN 
                users u
            ON 
                c.ownerToken = u.UserPublicToken
            WHERE 
                c.videoToken = $1;
        `;
        const getVideoComments = await query(connection, GetVideoCommentsSQL, [req.params.videoToken]);

        if (getVideoComments.length === 0) {
            return res.status(202).json({ error: false, CommentsFound: false });
        }

        const VideoCommentsToBeSend: Array<IVideoCommentsToBeSendType> = getVideoComments.map((comment: any) => ({
            id: comment.id,
            ownerToken: comment.ownertoken,
            videoToken: comment.videotoken,
            comment: comment.comment,
            ownerName: comment.ownername,
        }));

        return res.status(202).json({
            error: false,
            comments: VideoCommentsToBeSend,
            CommentsFound: true,
        });
    } catch (error: any) {
        connection?.release();
        logging.error('POST_COMMENT_FUNC', error.message);
        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { GetVideoComments, PostCommentToVideo, DeleteComment };
