import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import multer from 'multer';
import utilFunctions from '../../util/utilFunctions';
import fs from 'fs';

const NAMESPACE = 'OwnerPackageServiceManager';

/**
 * Validates and cleans the CustomRequest form
 */
// const CustomRequestValidationResult = validationResult.withDefaults({
//     formatter: (error) => {
//         return {
//             errorMsg: error.msg,
//         };
//     },
// });

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

        console.log(req.body);
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
                // Insert into Packages table
                const insertPackagesQuery = `
      INSERT INTO Packages (PackageToken, OwnerToken, PackageName, Rating, Tier, PhotosNumber, VideosNumber)
      VALUES
        ($1, $2, $3, 0, 'basic', 0, 0),
        ($1, $2, $3, 0, 'standard', 0, 0),
        ($1, $2, $3, 0, 'premium', 0, 0)
      ON CONFLICT (PackageToken) DO NOTHING;
    `;
                await query(connection, insertPackagesQuery, [PackageToken, userPublicToken, req.body.PackageName], true);

                // Insert into BasicTier table
                const insertBasicTierQuery = `
      INSERT INTO BasicTier (PackageToken, Price, Recurring, acces_videos, coaching_101, custom_program, Description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (PackageToken) DO NOTHING;
    `;
                await query(
                    connection,
                    insertBasicTierQuery,
                    [PackageToken, req.body.BasicPrice, req.body.basicRecurring, req.body.basicAccesVideos, req.body.basicCoaching, req.body.basicCustomProgram, req.body.basicDescription],
                    true,
                );

                // Insert into StandardTier table
                const insertStandardTierQuery = `
      INSERT INTO StandardTier (PackageToken, Price, Recurring, acces_videos, coaching_101, custom_program, Description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (PackageToken) DO NOTHING;
    `;
                await query(
                    connection,
                    insertStandardTierQuery,
                    [PackageToken, req.body.StandardPrice, req.body.standardRecurring, req.body.standardAccesVideos, req.body.standardCoaching, req.body.standardCustomProgram, req.body.standardDescription],
                    true,
                );

                // Insert into PremiumTier table
                const insertPremiumTierQuery = `
      INSERT INTO PremiumTier (PackageToken, Price, Recurring, acces_videos, coaching_101, custom_program, Description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (PackageToken) DO NOTHING;
    `;
                await query(connection, insertPremiumTierQuery, [
                    PackageToken,
                    req.body.PremiumPrice,
                    req.body.premiumRecurring,
                    req.body.premiumAccesVideos,
                    req.body.premiumCoaching,
                    req.body.premiumCustomProgram,
                    req.body.premiumDescription,
                ]);

                for (let i = 1; i <= 5; i++) {
                    const photo = (req.files as { [fieldname: string]: Express.Multer.File[] })[`Photo_${i}`]?.[0];
                    if (photo !== undefined) {
                        try {
                            await fs.promises.rename(
                                `${process.env.ACCOUNTS_FOLDER_PATH}/PhotosTmp/${photo.originalname}`,
                                `${process.env.ACCOUNTS_FOLDER_PATH}/${userPublicToken}/Package_${PackageToken}/Photo_${i}.jpg`,
                            );
                        } catch (err: any) {
                            logging.error('FILE_UPLOAD', err);

                            return res.status(200).json({
                                error: false,
                            });
                        }
                    }
                }

                return res.status(200).json({
                    error: false,
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

export default { CreatePackage };
