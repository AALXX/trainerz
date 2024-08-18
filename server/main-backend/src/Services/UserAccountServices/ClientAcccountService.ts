import { Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';
import { connect, CustomRequest, query } from '../../config/postgresql';
import UtilFunc from '../../util/utilFunctions';

const NAMESPACE = 'ClientVideosServiceManager';

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
 * Gets a public  creator account data by User Public Token
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const GetCreatorAccountData = async (req: CustomRequest, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET_ACCOUNT_DATA', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }
    
    const connection = await connect(req.pool!);
    try {

        if (connection == null) {
            return false;
        }

        const GetUserDataQueryString = `SELECT UserName, Description,  AccountFolowers, Sport, PhoneNumber, UserEmail, AccountType, userVisibility FROM users WHERE UserPublicToken='${req.params.profileToken}';`;

        const accData = await query(connection, GetUserDataQueryString);

        let itFollows = false;
        if (req.params.userPublicToken != null) {
            itFollows = await UtilFunc.userFollowAccountCheck(req.pool!, req.params.userPublicToken, req.params.profileToken);
        }

        if (Object.keys(accData).length === 0) {
            return res.status(200).json({
                error: false,
                userData: null,
                userFollowsCreator: false,
            });
        }

        return res.status(200).json({
            error: false,
            userData: accData[0],
            userFollowsCreator: itFollows,
        });
    } catch (error: any) {
        connection?.release();
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default { GetCreatorAccountData };
