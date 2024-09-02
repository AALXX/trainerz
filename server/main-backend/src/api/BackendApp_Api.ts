import http from 'http';
import express, { NextFunction } from 'express';

//* imports from route folder
import UserAccountManagerRoutes from '../routes/UserAccountManager/UserAccountManagerRoutes';
import VideosManagerRoutes from '../routes/VideosManager/VideosManagerRoutes';
import PackageManagerRoutes from '../routes/PackageRoutes/PackageRoutes';
import PaymentManagerRoutes from '../routes/PaymentRoutes/PaymentRoutes';
import WorkputProgramsManagerRoutes from '../routes/WorkoutProgramsManager/WorkoutProgramsManagerRoutes';
import RecommandationManagerRoutes from '../routes/RecommandationManager/RecommandationManagerRoutes';

//* Configs
import config from '../config/config';
import logging from '../config/logging';
import { createPool } from '../config/postgresql';
import Stripe from 'stripe';
const NAMESPACE = 'BackendApp_Api';
const router = express();

router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ limit: '10mb', extended: true }));

const pool = createPool();
const stripe = new Stripe(`${process.env.StripeKey}`, { apiVersion: '2024-04-10' });

//* Rules of Api
router.use((req: any, res: any, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    req.pool = pool;
    req.stripe = stripe;

    if (req.method == 'OPTIONS') {
        res.header('Acces-Control-Allow-Methods', 'GET POST PATCH DELETE PUT');
        return res.status(200).json({});
    }
    next();
});

//* Routes
router.use('/api/user-account-manager/', UserAccountManagerRoutes);
router.use('/api/videos-manager/', VideosManagerRoutes);
router.use('/api/programs-manager/', WorkputProgramsManagerRoutes);
router.use('/api/package-manager/', PackageManagerRoutes);
router.use('/api/payment-manager/', PaymentManagerRoutes);
router.use('/api/recomandation-manager/', RecommandationManagerRoutes);;

//* Error Handleling
router.use((req: any, res: any, next: NextFunction) => {
    const error = new Error('not found');

    return res.status(404).json({
        message: error.message,
    });
});

//* Create The Api
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => {
    logging.info(NAMESPACE, `Api is runing on: ${config.server.hostname}:${config.server.port}`);
});
