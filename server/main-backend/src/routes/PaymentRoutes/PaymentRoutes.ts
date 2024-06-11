import express from 'express';
import { body, param } from 'express-validator';
import PaymentServices from '../../Services/PaymentServices/PaymentServices';
const router = express.Router();

router.post('/checkout', body('paymentMethodId').not().isEmpty(), body('UserPrivateToken').not().isEmpty(), body('priceId').not().isEmpty(), PaymentServices.CheckoutPackage);

export = router;
