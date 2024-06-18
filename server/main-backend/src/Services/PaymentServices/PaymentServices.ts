import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import multer from 'multer';
import utilFunctions from '../../util/utilFunctions';

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => logging.error('CHECKOUT_PACKAGE', error.msg));
        return res.status(400).json({ error: true, errors: errors.array() });
    }

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
            const connection = await connect(req.pool!);

            if (connection == null) {
                return res.status(500).json({
                    error: true,
                    errmsg: "couldn't connect to database",
                });
            }

            const tierData = await query(connection, GetTierQueryString, [priceId], true);

            const InsertQuery = `INSERT INTO Subscriptions (PackageToken, UserpublicToken, Tier) VALUES ($1, $2, $3);`;

            await query(connection, InsertQuery, [tierData[0].packagetoken, UserPublicToken, tierData[0].tier]);

            return res.status(200).json({
                error: false,
            });
        }

        return res.status(500).json({
            error: true,
        });
    } catch (error: any) {
        logging.error('CHECKOUT_PACKAGE', error.message);
        return res.status(500).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { CheckoutPackage };
