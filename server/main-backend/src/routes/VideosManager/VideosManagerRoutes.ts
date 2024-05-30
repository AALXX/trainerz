import express from 'express';
import { body, param } from 'express-validator';
// import ClientVideoServices from '../../Services/VideosServices/ClientVideosServices';
import OwnerVideoServices from '../../Services/VideosServices/OwnerVideosServices';
const router = express.Router();


// *client video related
// router.post('/like-dislike-video/', body('userToken').not().isEmpty().trim(), body('videoToken').not().isEmpty().trim(), ClientVideosServices.LikeDislikeVideoFunc);
// router.get('/get-video-data/:VideoToken/:UserPrivateToken', param('VideoToken').not().isEmpty(), param('UserPrivateToken').not().isEmpty(), ClientVideosServices.GetVideoDataByToken);
// router.get('/search-video/:search_query', param('search_query').not().isEmpty(), ClientVideosServices.SearchVideo);

// *Video Owner related
router.get('/get-account-videos/:UserPublicToken', param('UserPublicToken').not().isEmpty().trim(), OwnerVideoServices.GetAccountVideos);
// router.get('/get-creator-video-data/:UserPrivateToken/:VideoToken', param('VideoToken').not().isEmpty(), AccountVideoServices.GetCreatorVideoData);
router.post('/upload-video', OwnerVideoServices.UploadVideoFileToServer);
// router.post(
//     '/update-creator-video-data',
//     body('VideoTitle').not().isEmpty().isLength({ max: 40 }),
//     body('VideoVisibility').not().isEmpty(),
//     body('ShowComments').not().isEmpty(),
//     body('ShowLikesDislikes').not().isEmpty(),
//     body('VideoToken').not().isEmpty(),
//     body('UserPrivateToken').not().isEmpty(),
//     AccountVideoServices.UpdateCreatorVideoData,
// );
// router.post('/delete-video', body('VideoToken').not().isEmpty(), body('UserPrivateToken').not().isEmpty(), AccountVideoServices.DeleteCreatorVideoData);
// router.post('/change-thumbnail', AccountVideoServices.ChangeVideoThumbnail);
// router.post('/update-video-alalytics', AccountVideoServices.UpdateVideoAnalytics);
// router.get('/get-video-history-data/:UserPrivateToken/:VideoToken', AccountVideoServices.GetVideoHistory);

// // *comment related
// router.get('/get-video-comments/:videoToken', param('videoToken').not().isEmpty(), ClientVideosServices.GetVideoComments);
// router.post('/post-comment', body('UserToken').not().isEmpty(), body('VideoToken').not().isEmpty(), body('Comment').not().isEmpty(), ClientVideosServices.PostCommentToVideo);
// router.post('/delete-comment', body('UserToken').not().isEmpty(), body('VideoToken').not().isEmpty(), ClientVideosServices.PostCommentToVideo);

export = router;
