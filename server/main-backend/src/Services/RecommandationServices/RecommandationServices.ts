import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import utilFunctions from '../../util/utilFunctions';
import { SCYconnect, SCYquery } from '../../config/scylla';

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

const GetHomeRecommandations = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_HOME_RECOMMANDATIONS', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    const connection = await connect(req.pool!);

    try {
        const UserPublicToken = await utilFunctions.getUserPublicTokenFromPrivateToken(req.pool!, req.params.UserPrivateToken);
        if (!UserPublicToken) {
            const GetTopRatedPackages = await query(
                connection!,
                `SELECT
                    PackageName,
                    PackageToken,
                    PackageSport,
                    Rating,
                    OwnerToken
                FROM
                    packages
                ORDER BY
                    Rating DESC
                 LIMIT 10`,
            );

            return res.status(200).json({
                error: false,
                GetFittedPackages: GetTopRatedPackages,
            });
        }

        const GetUserInterest = await query(
            connection!,
            `SELECT
                Sport
            FROM
                users
            WHERE
                UserPublicToken = $1`,
            [UserPublicToken],
            true,
        );

        const GetFittedPackages = await query(
            connection!,
            `SELECT
                PackageName,
                PackageToken,
                PackageSport,
                Rating,
                OwnerToken
            FROM
                packages
            WHERE
                PackageSport = $1
            ORDER BY
                    Rating DESC;`,
            [GetUserInterest[0].sport],
        );

        return res.status(200).json({
            error: false,
            GetFittedPackages: GetFittedPackages,
        });
    } catch (error: any) {
        logging.error('CHECKOUT_PACKAGE', error.message);
        connection?.release();
        return res.status(200).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { GetHomeRecommandations };
