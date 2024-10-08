import express from 'express';
import { body, param } from 'express-validator';
import ClientPackageServices from '../../Services/PackageServices/ClientPackageServices';
import OwnerPackageServices from '../../Services/PackageServices/OwnerPackageServices';
const router = express.Router();

router.post('/create-package', OwnerPackageServices.CreatePackage);
router.get('/get-account-packages/:userPublicToken', param('userPublicToken').not().isEmpty(), OwnerPackageServices.GetPackages);
router.post(
    '/update-package',
    body('userPrivateToken').not().isEmpty(),
    body('packageToken').not().isEmpty(),
    body('packageName').not().isEmpty(),
    body('sport').not().isEmpty(),
    body('basicTier').not().isEmpty(),
    body('standardTier').not().isEmpty(),
    body('premiumTier').not().isEmpty(),

    OwnerPackageServices.UpdatePackage,
);

router.get('/get-package-data/:packageToken', param('packageToken').not().isEmpty(), ClientPackageServices.GetPackageData);

router.get('/get-subscribed-packages/:userPrivateToken', param('userPrivateToken').not().isEmpty(), ClientPackageServices.GetSubscribedPackages);

router.post('/post-review', body('userPrivateToken').not().isEmpty(), body('packageToken').not().isEmpty(), body('reviewText').not().isEmpty(), body('rating').not().isEmpty(), ClientPackageServices.PostReview);

router.get('/get-package-reviews/:packageToken', param('packageToken').not().isEmpty(), ClientPackageServices.GetPackageReviews);

export = router;
 
