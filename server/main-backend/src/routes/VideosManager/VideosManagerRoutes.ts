import express from 'express';
import { body, param } from 'express-validator';
import ClientVideoServices from '../../Services/VideosServices/ClientVideosServices';
import CommentsServices from '../../Services/VideosServices/CommentsServices';
import OwnerVideoServices from '../../Services/VideosServices/OwnerVideosServices';
const router = express.Router();

// *client video related
router.post('/like-dislike-video/', body('UserPublicToken').not().isEmpty().trim(), body('videoToken').not().isEmpty().trim(), ClientVideoServices.LikeDislikeVideoFunc);
router.get('/get-video-data/:VideoToken/:UserPrivateToken', param('VideoToken').not().isEmpty(), param('UserPrivateToken').not().isEmpty(), ClientVideoServices.GetVideoDataByToken);

router.get('/subscription-check/:VideoToken/:UserPrivateToken', param('VideoToken').not().isEmpty().trim(), param('UserPrivateToken').not().isEmpty().trim(), ClientVideoServices.SubscribtionCheck);

// *Video Owner related
router.get('/get-account-videos/:UserPublicToken', param('UserPublicToken').not().isEmpty().trim(), OwnerVideoServices.GetAccountVideos);
router.get('/get-creator-video-data/:UserPrivateToken/:VideoToken', param('VideoToken').not().isEmpty(), OwnerVideoServices.GetCreatorVideoData);
router.post('/upload-video', OwnerVideoServices.UploadVideoFileToServer);
router.post(
    '/update-creator-video-data',
    body('VideoTitle').not().isEmpty().isLength({ max: 40 }),
    body('VideoVisibility').not().isEmpty(),
    body('PackageToken').not().isEmpty(),
    body('VideoToken').not().isEmpty(),
    body('UserPrivateToken').not().isEmpty(),
    OwnerVideoServices.UpdateCreatorVideoData,
);
// router.post('/delete-video', body('VideoToken').not().isEmpty(), body('UserPrivateToken').not().isEmpty(), AccountVideoServices.DeleteCreatorVideoData);
// router.post('/change-thumbnail', AccountVideoServices.ChangeVideoThumbnail);
// router.post('/update-video-alalytics', AccountVideoServices.UpdateVideoAnalytics);
// router.get('/get-video-history-data/:UserPrivateToken/:VideoToken', AccountVideoServices.GetVideoHistory);

// *comment related
router.get('/get-video-comments/:videoToken', param('videoToken').not().isEmpty(), CommentsServices.GetVideoComments);
router.post('/post-comment', body('UserPrivateToken').not().isEmpty(), body('VideoToken').not().isEmpty(), body('Comment').not().isEmpty(), CommentsServices.PostCommentToVideo);
router.post('/delete-comment', body('UserPrivateToken').not().isEmpty(), body('VideoToken').not().isEmpty(), body('CommentID').not().isEmpty(), CommentsServices.DeleteComment);

export = router;
