import express from 'express';
import { body, param } from 'express-validator';
import RecomandationServices from '../../Services/RecommandationServices/RecommandationServices';
const router = express.Router();

router.get('/get-home-recommendations/:UserPrivateToken', param('UserPrivateToken').not().isEmpty(), RecomandationServices.GetHomeRecommandations);

export = router;
