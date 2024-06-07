import express from 'express';
import { body, param } from 'express-validator';
// import ClientVideoServices from '../../Services/VideosServices/ClientVideosServices';
import OwnerPackageServices from '../../Services/PackageServices/OwnerPackageServices';
const router = express.Router();


router.post('/create-package', OwnerPackageServices.CreatePackage);

router.get('/get-account-packages/:userPublicToken', param('userPublicToken').not().isEmpty(), OwnerPackageServices.GetPackages);


export = router;
