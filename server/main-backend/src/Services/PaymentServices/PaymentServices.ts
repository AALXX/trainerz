import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import multer from 'multer';
import utilFunctions from '../../util/utilFunctions';
import { SCYconnect, SCYquery } from '../../config/scylla';
import fs from 'fs';

const NAMESPACE = 'PaymentServiceManager';

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
 * Retrieves a list of packages owned by a user.
 *
 * @param req - The custom request object containing the user's public token.
 * @param res - The response object to send the package data.
 * @returns A JSON response with the package data, or an error response if there is an issue.
 */
const CheckoutPackage = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('CHECKOUT_PACKAGE_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);
    try {
        const { UserPrivateToken, priceId, paymentMethodId } = req.body;

        const UserEmail = await utilFunctions.getUserEmailFromPrivateToken(req.pool!, UserPrivateToken);
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, UserPrivateToken);
        if (!UserEmail) {
            return res.status(404).json({ error: true, errmsg: 'Email not found' });
        }

        const price = await req.stripe?.prices.retrieve(priceId);
        if (!price) {
            return res.status(404).json({ error: true, errmsg: 'Price not found' });
        }

        let customer = (await req.stripe?.customers.list({ email: UserEmail })!).data[0];

        if (!customer) {
            return res.status(400).json({
                error: true,
                errmsg: 'customer not found',
            });
        }

        await req.stripe?.paymentMethods.attach(paymentMethodId, { customer: customer.id });
        await req.stripe?.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethodId } });

        const subscription = await req.stripe?.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
        });

        if (!subscription) {
            return res.status(400).json({
                error: true,
                errmsg: 'Subscription not found',
            });
        }

        if (subscription?.status === 'active') {
            const GetTierQueryString = `
            SELECT 'BasicTier' AS Tier, PackageToken, PriceID, Price, Recurring, acces_videos, coaching_101, custom_program, Description FROM BasicTier 
            WHERE PriceID = $1 
            
            UNION 
            
            SELECT 'PremiumTier' AS Tier, PackageToken, PriceID, Price, Recurring, acces_videos, coaching_101, custom_program, Description
            FROM PremiumTier
            WHERE PriceID = $1

            UNION

            SELECT 'StandardTier' AS Tier, PackageToken, PriceID, Price, Recurring, acces_videos, coaching_101, custom_program, Description
            FROM StandardTier
            WHERE PriceID = $1;`;

            if (connection == null) {
                return res.status(500).json({
                    error: true,
                    errmsg: "couldn't connect to database",
                });
            }

            const tierData = await query(connection, GetTierQueryString, [priceId], true);

            const InsertQuery = `INSERT INTO Subscriptions (PackageToken, UserpublicToken, Tier, SubsciptionId) VALUES ($1, $2, $3, $4);`;

            await query(connection, InsertQuery, [tierData[0].packagetoken, UserPublicToken, tierData[0].tier, subscription.id]);

            if (tierData[0].coaching_101) {
                const QueryString = `SELECT OwnerToken FROM Packages WHERE PackageToken = $1;`;
                const data = await query(connection, QueryString, [tierData[0].packagetoken], true);

                const chatToken = utilFunctions.CreateToken();

                fs.mkdir(`${process.env.CHATS_FOLDER_PATH}/${chatToken}/`, async (err) => {
                    if (err) {
                        logging.error(NAMESPACE, err.message);
                        return res.status(500).json({ error: true, errormsg: 'Directory creation error' });
                    }

                    await SCYconnect();
                    await SCYquery(
                        `INSERT INTO Chats (id, chatToken, athlete_public_token, trainer_public_token, PackageToken) VALUES (uuid(), '${chatToken}', '${UserPublicToken}', '${data[0].ownertoken}', '${tierData[0].packagetoken}');`,
                    );
                });
                return res.status(200).json({
                    newChat: true,
                    error: false,
                });
            }

            return res.status(200).json({
                newChat: false,
                error: false,
            });
        }

        return res.status(500).json({
            error: true,
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

/**
 * Cancels a user's subscription.
 *
 * @param req - The custom request object containing the necessary data to cancel the subscription.
 * @param res - The response object to send the result of the cancellation operation.
 * @returns A JSON response indicating the success or failure of the cancellation operation.
 */
const CacnelSubscription = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('CANCEL_SUB_FUNC', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);

    try {
        const UserEmail = await utilFunctions.getUserEmailFromPrivateToken(req.pool!, req.body.UserPrivateToken);
        if (UserEmail == null) {
            return res.status(404).json({ error: true, errmsg: 'Email not found' });
        }

        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.body.UserPrivateToken);
        if (UserPublicToken == null) {
            return res.status(404).json({ error: true, errmsg: 'Email not found' });
        }

        const QueryString = `SELECT SubsciptionId FROM subscriptions WHERE UserpublicToken=$1 AND PackageToken = $2;`;

        if (connection == null) {
            return res.status(500).json({
                error: true,
                errmsg: "couldn't connect to database",
            });
        }

        const subscription = await query(connection, QueryString, [UserPublicToken, req.body.PackageToken], true);

        const deletedSubscription = await req.stripe?.subscriptions.cancel(subscription[0].subsciptionid);

        const DeleteQuery = `DELETE FROM Subscriptions WHERE UserpublicToken = $1 AND PackageToken = $2 AND SubsciptionId = $3;`;
        await query(connection, DeleteQuery, [UserPublicToken, req.body.PackageToken, subscription[0].subsciptionid]);

        if (deletedSubscription == null) {
            return res.status(400).json({
                error: true,
                errmsg: 'Subscription not found',
            });
        }

        return res.status(200).json({
            error: false,
        });
    } catch (error: any) {
        connection?.release();
        logging.error('CHECKOUT_PACKAGE', error.message);
        return res.status(200).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { CheckoutPackage, CacnelSubscription };
