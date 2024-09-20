import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
async function checkAccountStatus() {
    const cookieStore = cookies()
    const userPrivateToken = cookieStore.get('userToken')?.value
    const userPublicToken = cookieStore.get('userPublicToken')?.value

    if (userPrivateToken && userPublicToken) {
        try {
            jwt.verify(userPrivateToken, process.env.ACCOUNT_SECRET as string)
            return { isLoggedIn: true, userPrivateToken, userPublicToken }
        } catch (error) {
            cookieStore.delete('userToken')
            cookieStore.delete('userPublicToken')
            cookieStore.delete('accountType')
            return { isLoggedIn: false }
        }
    }
    return { isLoggedIn: false }
}

export { checkAccountStatus }
