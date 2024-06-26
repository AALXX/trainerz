import express from 'express';
import { body, param } from 'express-validator';

import OwnerAccountServices from '../../Services/UserAccountServices/OwnerAccountServices';
import ClientAccountServices from '../../Services/UserAccountServices/ClientAcccountService';

const router = express.Router();

//* Owner Account data
router.post(
    '/register-account',

    body('userName').not().isEmpty(),
    body('userEmail').isEmail().not().isEmpty(),
    body('password').isLength({ min: 4 }).not().isEmpty().trim(),
    body('phoneNumber').not().isEmpty(),
    body('sport').not().isEmpty(),
    body('description'),
    body('accountType').not().isEmpty(),
    body('userBirthDate').not().isEmpty(),
    body('locationLat').not().isEmpty(),
    body('locationLon').not().isEmpty(),
    OwnerAccountServices.RegisterUser,
);

router.post('/login-account', body('userEmail').isEmail().not().isEmpty(), body('password').isLength({ min: 4 }).not().isEmpty().trim(), OwnerAccountServices.LoginUser);

router.post(
    '/account-owner-check',
    body('accountPrivateToken').not().isEmpty().trim(),
    body('accountPublicToken').not().isEmpty().trim(),
    body('profilePublicToken').not().isEmpty().trim(),
    OwnerAccountServices.CheckAccountOwner,
);

router.get('/get-account-data/:accountPrivateToken', param('accountPrivateToken').not().isEmpty(), OwnerAccountServices.GetUserAccountData);

router.post(
    '/change-user-data',
    body('userName').not().isEmpty(),
    body('userEmail').not().isEmpty(),
    body('userDescription'),
    body('sport').not().isEmpty(),
    body('price'),
    body('accountType').not().isEmpty(),
    body('userVisibility').not().isEmpty(),
    body('userPrivateToken').not().isEmpty(),
    OwnerAccountServices.ChangeUserData,
);

router.post('/delete-user-account', body('userToken').not().isEmpty(), OwnerAccountServices.DeleteUserAccount);

router.get('/get-creator-data/:profileToken/:userPublicToken', param('profileToken').not().isEmpty(), param('userPublicToken').not().isEmpty(), ClientAccountServices.GetCreatorAccountData);

// router.post('/upload-user-image', OwnerAccountServices.UploadPhoto);
router.post('/change-user-icon', OwnerAccountServices.ChangeUserIcon);

// router.get('/get-account-subscriptions/:userPrivateToken', param('userPrivateToken').not().isEmpty(), UserAccountServices.GetUserAccountSubscriptions);

// router.get('/get-account-public-data/:accountPublicToken', param('accountPublicToken').not().isEmpty(), ClientAccountServices.GetUserAccountPublicData);

// router.get('/get-account-photos/:accountPublicToken', param('accountPublicToken').not().isEmpty(), ClientAccountServices.GetAccountPhotos);

export = router;
