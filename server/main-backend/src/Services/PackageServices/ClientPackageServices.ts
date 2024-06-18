import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import UtilFunc from '../../util/utilFunctions';

const NAMESPACE = 'ClientPackageServiceManager';

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
 * Retrieves package data from the database based on the provided package token.
 *
 * @param {CustomRequest} req - The custom request object containing the package token.
 * @param {Response} res - The Express response object to send the package data.
 * @returns A JSON response with the package data or an error message.
 */
const GetPackageData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        const connection = await connect(req.pool!);

        if (connection == null) {
            return false;
        }

        const QueryString = `SELECT 
            p.id,
            p.OwnerToken,
            p.PackageName,
            p.Rating,
            p.PackageSport,
            p.Tier,
            p.PhotosNumber,
            p.VideosNumber,
            bt.Price AS BasicPrice,
            bt.priceid AS BasicPriceId,
            bt.Recurring AS BasicRecurring,
            bt.acces_videos AS BasicAccesVideos,
            bt.coaching_101 AS BasicCoaching,
            bt.custom_program AS BasicCustomProgram,
            bt.Description AS BasicDescription,
            st.Price AS StandardPrice,
            st.priceid AS StandardPriceId,
            st.Recurring AS StandardRecurring,
            st.acces_videos AS StandardAccesVideos,
            st.coaching_101 AS StandardCoaching,
            st.custom_program AS StandardCustomProgram,
            st.Description AS StandardDescription,
            pt.Price AS PremiumPrice,
            pt.priceid AS PremiumPriceId,
            pt.Recurring AS PremiumRecurring,
            pt.acces_videos AS PremiumAccesVideos,
            pt.coaching_101 AS PremiumCoaching,
            pt.custom_program AS PremiumCustomProgram,
            pt.Description AS PremiumDescription
        FROM 
            Packages p
        LEFT JOIN 
            BasicTier bt ON p.PackageToken = bt.PackageToken
        LEFT JOIN 
            StandardTier st ON p.PackageToken = st.PackageToken
        LEFT JOIN 
            PremiumTier pt ON p.PackageToken = pt.PackageToken
        WHERE 
            p.PackageToken = $1;`;

        const data = await query(connection, QueryString, [req.params.packageToken]);
        if (Object.keys(data).length === 0) {
            return res.status(200).json({
                error: false,
                packageData: null,
            });
        }

        return res.status(200).json({
            error: false,
            ownerToken: data[0].ownertoken,
            packageName: data[0].packagename,
            photosNumber: data[0].photosnumber,
            sport: data[0].packagesport,
            rating: data[0].rating,

            basicTier: {
                price: data[0].basicprice,
                priceId: data[0].basicpriceid,
                recurring: data[0].basicrecurring,
                acces_videos: data[0].basicaccesvideos,
                coaching_101: data[0].basiccoaching,
                custom_program: data[0].basiccustomprogram,
                description: data[0].basicdescription,
            },

            standardTier: {
                price: data[0].standardprice,
                priceId: data[0].standardpriceid,
                recurring: data[0].standardrecurring,
                acces_videos: data[0].standardaccesvideos,
                coaching_101: data[0].standardcoaching,
                custom_program: data[0].standardcustomprogram,
                description: data[0].standarddescription,
            }, 

            premiumTier: {
                price: data[0].premiumprice,
                priceId: data[0].premiumpriceid,
                recurring: data[0].premiumrecurring,
                acces_videos: data[0].premiumaccesvideos,
                coaching_101: data[0].premiumcoaching,
                custom_program: data[0].premiumcustomprogram,
                description: data[0].premiumdescription,
            },
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { GetPackageData };
