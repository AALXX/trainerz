import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import multer from 'multer';
import utilFunctions from '../../util/utilFunctions';
import fs from 'fs';
import axios from 'axios';
import FFmpeg from 'fluent-ffmpeg';
import Stripe from 'stripe';

const NAMESPACE = 'OwnerPackageServiceManager';

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
 * file storage
 */
const storage = multer.diskStorage({
    destination: (req: CustomRequest, file: any, callback: any) => {
        callback(null, `${process.env.ACCOUNTS_FOLDER_PATH}/PhotosTmp`);
    },

    filename: (req: CustomRequest, file: any, cb: any) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req: CustomRequest, file: any, cb: any) => {
    // reject all files except jpeg
    if (file.mimetype === 'image/*') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const PhotoUploader = multer({
    storage: storage,
    // fileFilter: fileFilter,
}).fields([
    {
        name: 'Photo_1',
        maxCount: 1,
    },
    {
        name: 'Photo_2',
        maxCount: 1,
    },
    {
        name: 'Photo_3',
        maxCount: 1,
    },
    {
        name: 'Photo_4',
        maxCount: 1,
    },
    {
        name: 'Photo_5',
        maxCount: 1,
    },
]);

/**
 * Creates a new package for a user.
 *
 * @param req - The custom request object containing the user's private token, package details, and uploaded photos.
 * @param res - The response object to send the package creation status.
 * @returns A JSON response indicating whether the package creation was successful or not.
 */
const CreatePackage = async (req: CustomRequest, res: Response) => {
    PhotoUploader(req, res, async (err: any) => {
        if (err) {
            return res.status(200).json({
                msg: 'falied to upload',
                error: true,
            });
        }

        const userPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);
        if (userPublicToken == null) {
            return res.status(200).json({
                error: true,
            });
        }

        const PackageToken = utilFunctions.CreateToken();
        fs.mkdir(`${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/Package_${PackageToken}/`, async (err) => {
            if (err) {
                console.log(err);
                return res.status(200).json({
                    error: true,
                });
            }

            const connection = await connect(req.pool!);

            if (connection == null) {
                return res.status(500).json({
                    message: 'connection issue with db',
                    error: true,
                });
            }

            try {
                // Count the number of photos uploaded
                let photosCount = 0;
                for (let i = 1; i <= 5; i++) {
                    if ((req.files as { [fieldname: string]: Express.Multer.File[] })[`Photo_${i}`]?.[0]) {
                        photosCount++;
                    }
                }

                await query(connection, 'BEGIN;', [], true);

                // Insert into Packages table
                const insertPackagesQuery = `
      INSERT INTO Packages (PackageToken, OwnerToken, PackageName, PackageSport, Rating,  Tier, PhotosNumber, VideosNumber)
      VALUES
        ($1, $2, $3, $4, 0, 'basic', $5, 0),
        ($1, $2, $3, $4, 0, 'standard', $5, 0),
        ($1, $2, $3, $4, 0, 'premium', $5, 0)
      ON CONFLICT (PackageToken) DO NOTHING;
    `;
                await query(connection, insertPackagesQuery, [PackageToken, userPublicToken, req.body.PackageName, req.body.Sport, photosCount], true);

                for (let i = 1; i <= 5; i++) {
                    const photo = (req.files as { [fieldname: string]: Express.Multer.File[] })[`Photo_${i}`]?.[0];
                    if (photo !== undefined) {
                        try {
                            await PhotoProceesor(`${process.env.ACCOUNTS_FOLDER_PATH}/PhotosTmp/${photo.originalname}`, `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/Package_${PackageToken}/Photo_${i}.jpg`);

                            // await fs.unlinkSync(`${process.env.ACCOUNTS_FOLDER_PATH}/PhotosTmp/${photo.originalname}`);
                        } catch (err: any) {
                            logging.error('FILE_UPLOAD', err);
                            await connection.query('ROLLBACK');

                            return res.status(200).json({
                                error: true,
                            });
                        }
                    }
                }

                // Create Stripe product
                const product = await req.stripe?.products.create({
                    name: req.body.PackageName,
                    metadata: { PackageToken: PackageToken, OwnerToken: userPublicToken },
                });

                if (product!.id != null) {
                    // Create Stripe prices
                    const prices = [
                        {
                            tier: 'BasicTier',
                            unit_amount: req.body.BasicPrice,
                            currency: 'eur',
                            recurring: req.body.basicRecurring,
                            product: product!.id,
                            accessVideos: req.body.basicAccesVideos,
                            coaching: req.body.basicCoaching,
                            customProgram: req.body.basicCustomProgram,
                            description: req.body.basicDescription,
                        },
                        {
                            tier: 'StandardTier',
                            unit_amount: req.body.StandardPrice,
                            currency: 'eur',
                            recurring: req.body.standardRecurring,
                            product: product!.id,
                            accessVideos: req.body.standardAccesVideos,
                            coaching: req.body.standardCoaching,
                            customProgram: req.body.standardCustomProgram,
                            description: req.body.standardDescription,
                        },
                        {
                            tier: 'PremiumTier',
                            unit_amount: req.body.PremiumPrice,
                            currency: 'eur',
                            recurring: req.body.premiumRecurring,
                            product: product!.id,
                            accessVideos: req.body.premiumAccesVideos,
                            coaching: req.body.premiumCoaching,
                            customProgram: req.body.premiumCustomProgram,
                            description: req.body.premiumDescription,
                        },
                    ];

                    for (const price of prices) {
                        const priceParams: Stripe.PriceCreateParams = {
                            unit_amount: price.unit_amount * 100,
                            currency: price.currency,
                            product: price.product,
                        };

                        if (price.recurring) {
                            priceParams.recurring = { interval: 'month' };
                        }

                        const priceResp = await req.stripe?.prices.create(priceParams);
                        console.log(price);
                        // Insert into BasicTier table
                        const insertBasicTierQuery = `
      INSERT INTO ${price.tier} (PackageToken, Price, PriceID, Recurring, acces_videos, coaching_101, custom_program, Description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (PackageToken) DO NOTHING;
    `;
                        await query(connection, insertBasicTierQuery, [PackageToken, price.unit_amount, priceResp?.id, price.recurring, price.accessVideos, price.coaching, price.customProgram, price.description], true);
                    }

                    await query(connection, 'COMMIT;');

                    return res.status(200).json({
                        error: false,
                    });
                }

                return res.status(200).json({
                    error: true,
                });
            } catch (err: any) {
                await connection.query('ROLLBACK');
                logging.error('CREATE_PACKAGE_FUNC', err);
                return res.status(200).json({
                    error: false,
                });
            }
        });
    });
};

/**
 * Processes a photo by resizing it to 1280x720 resolution and saving it to the specified path.
 *
 * @param path - The path to the photo file to be processed.
 * @returns A Promise that resolves with an object containing an `error` property set to `false` if the processing is successful, or rejects with an error if there is an issue.
 */
const PhotoProceesor = async (path: string, outputPath: string) =>
    new Promise((resolve, reject) => {
        try {
            FFmpeg(path)
                .size('1280x720')
                .on('end', () => {
                    resolve({ error: false });
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    reject(err);
                })
                .save(outputPath)
                .run();
        } catch {}
    });

/**
 * Retrieves a list of packages owned by a user.
 *
 * @param req - The custom request object containing the user's public token.
 * @param res - The response object to send the package data.
 * @returns A JSON response with the package data, or an error response if there is an issue.
 */
const GetPackages = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('CHANGE_ACCOUNT_DATA_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return res.status(500).json({
                error: true,
                errmsg: "couldn't connect to database",
            });
        }

        const QueryString = `SELECT PackageToken, OwnerToken, PackageName, Rating, packagesport FROM  Packages WHERE OwnerToken = '${req.params.userPublicToken}';`;
        const data = await query(connection, QueryString);
        return res.status(202).json({
            error: false,
            packagesData: data,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(500).json({
            error: true,
            errmsg: error.message,
        });
    }
};

const UpdatePackage = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('UPDATE_PACKAGE_DATA_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }
    try {
        const connection = await connect(req.pool!);
        if (connection == null) {
            return res.status(500).json({
                error: true,
                errmsg: "couldn't connect to database",
            });
        }

        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.userPrivateToken);
        if (UserPublicToken == null) {
            return res.status(400).json({
                error: true,
                errmsg: 'User Not Found',
            });
        }

        const PackageOwnerQueryString = `SELECT PackageToken FROM Packages WHERE OwnerToken = $1 AND PackageToken = $2;`;

        const data = await query(connection, PackageOwnerQueryString, [UserPublicToken, req.body.packageToken], true);
        if (data.length == 0) {
            return res.status(400).json({
                error: true,
                errmsg: 'Package Not Found',
            });
        }

        const QueryString = `UPDATE Packages SET PackageSport = $1, PackageName = $2 WHERE PackageToken = $3;`;
        await query(connection, QueryString, [req.body.sport, req.body.packageName, req.body.packageToken], true);

        const QueryStringBasicTier = `UPDATE BasicTier
        SET
            Recurring = $1,
            acces_videos = $2,
            coaching_101 = $3,
            custom_program = $4,
            Description = $5
        WHERE PackageToken = $6;
        `;

        await query(
            connection,
            QueryStringBasicTier,
            [
                req.body.basicTier.recurring,
                req.body.basicTier.acces_videos,
                req.body.basicTier.custom_program,
                req.body.basicTier.coaching_101,
                req.body.basicTier.description,
                req.body.packageToken,
            ],
            true,
        );

        const QueryStringStandardTier = `UPDATE StandardTier
        SET
            Recurring = $1,
            acces_videos = $2,
            coaching_101 = $3,
            custom_program = $4,
            Description = $5
        WHERE PackageToken = $6;
        `;
        await query(
            connection,
            QueryStringStandardTier,
            [
                req.body.standardTier.recurring,
                req.body.standardTier.acces_videos,
                req.body.standardTier.custom_program,
                req.body.standardTier.coaching_101,
                req.body.standardTier.description,
                req.body.packageToken,
            ],
            true,
        );

        const QueryStringPremiumTier = `UPDATE PremiumTier
        SET
            Recurring = $1,
            acces_videos = $2,
            coaching_101 = $3,
            custom_program = $4,
            Description = $5
        WHERE PackageToken = $6;
        `;
        await query(connection, QueryStringPremiumTier, [
            req.body.premiumTier.recurring,
            req.body.premiumTier.acces_videos,
            req.body.premiumTier.custom_program,
            req.body.premiumTier.coaching_101,
            req.body.premiumTier.description,
            req.body.packageToken,
        ]);

        return res.status(202).json({
            error: false,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        return res.status(500).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { CreatePackage, GetPackages, UpdatePackage };
