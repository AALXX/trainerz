import { Response } from 'express';
import { validationResult, body } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import utilFunctions from '../../util/utilFunctions';

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

    const connection = await connect(req.pool!);
    try {
        if (connection == null) {
            return res.status(202).json({
                error: true,
            });
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
        connection?.release();
        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

const GetSubscribedPackages = async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => logging.error('CHECKOUT_PACKAGE', error.msg));
        return res.status(400).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        const UserEmail = await utilFunctions.getUserEmailFromPrivateToken(req.pool!, req.params.userPrivateToken);
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.userPrivateToken);
        if (!UserEmail) {
            connection?.release();

            return res.status(404).json({ error: true, errmsg: 'Email not found' });
        }

        if (connection == null) {
            return res.status(202).json({
                error: true,
            });
        }

        const QueryString = `SELECT p.PackageName, p.Rating, p.Tier, p.PackageSport, p.OwnerToken, p.PackageToken, u.UserName FROM Packages p LEFT JOIN subscriptions s ON p.PackageToken = s.PackageToken
        LEFT JOIN users u ON s.UserpublicToken = u.UserPublicToken WHERE s.Userpublictoken = $1;`;

        const products = await query(connection, QueryString, [UserPublicToken]);

        return res.status(200).json({
            packages: products,
            error: false,
        });
    } catch (error: any) {
        connection?.release();
        logging.error('CHECKOUT_PACKAGE', error.message);
        return res.status(500).json({
            error: true,
            errmsg: error.message,
        });
    }
};

const PostReview = async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => logging.error('POST_REVIEW_FUNC', error.msg));
        return res.status(400).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        // Get the public token for the user
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.userPrivateToken);
        if (!UserPublicToken) {
            connection?.release();
            return res.status(404).json({ error: true, errmsg: 'User not found' });
        }

        if (connection == null) {
            return res.status(202).json({ error: true });
        }

        // Create a new review token
        const ReviewToken = utilFunctions.CreateToken();

        // Insert the review
        const insertReviewQuery = `
        INSERT INTO reviews (ReviewToken, OwnerToken, PackageToken, ReviewText, ReviewRating)
        VALUES ($1, $2, $3, $4, $5);
        `;
        await query(connection, insertReviewQuery, [ReviewToken, UserPublicToken, req.body.packageToken, req.body.reviewText, req.body.rating], true);

        // Update the package rating after inserting the review
        const updatePackageRatingQuery = `
        WITH average_rating AS (
            SELECT AVG(ReviewRating) as rating
            FROM reviews
            WHERE PackageToken = $1
        )
        UPDATE packages
        SET Rating = ROUND((SELECT rating FROM average_rating))
        WHERE PackageToken = $1;
        `;
        await query(connection, updatePackageRatingQuery, [req.body.packageToken], true);

        // Calculate the new average rating across all packages by the owner
        const updateAccountRatingQuery = `
        WITH owner_packages_avg_rating AS (
            SELECT AVG(p.Rating) as owner_rating
            FROM packages p
            WHERE p.OwnerToken = $1
        )
        UPDATE users
        SET Rating = ROUND((SELECT owner_rating FROM owner_packages_avg_rating))
        WHERE UserPublicToken = $1;
        `;
        await query(connection, updateAccountRatingQuery, [UserPublicToken]);

        return res.status(200).json({ error: false });
    } catch (error: any) {
        connection?.release();
        logging.error('POST_REVIEW_FUNC', error.message);
        return res.status(500).json({ error: true, errmsg: error.message });
    }
};

const GetPackageReviews = async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => logging.error('GET_REVIEW_FUNC', error.msg));
        return res.status(400).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        if (connection == null) {
            return res.status(202).json({
                error: true,
            });
        }

        const QueryString = `SELECT r.ReviewText, r.ReviewRating, r.ReviewToken, r.ownertoken, u.UserName FROM reviews r LEFT JOIN users u ON r.OwnerToken = u.UserPublicToken WHERE r.PackageToken = $1;`;

        const reviwes = await query(connection, QueryString, [req.params.packageToken]);
        return res.status(200).json({
            reviews: reviwes,
            error: false,
        });
    } catch (error: any) {
        connection?.release();
        logging.error('GET_REVIEW_FUNC', error.message);
        return res.status(500).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { GetPackageData, GetSubscribedPackages, PostReview, GetPackageReviews };
