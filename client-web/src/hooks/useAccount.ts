import { useState } from 'react'
import axios from 'axios'
import { setCookie, getCookie, deleteCookie } from 'cookies-next'

const useAccountRegister = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const register = async (
        userName: string,
        userEmail: string,
        phoneNumber: string,
        password: string,
        repeatedPassword: string,
        description: string,
        sport: string,
        accountType: string,
        userBirthDate: Date,
        locationLat: number,
        locationLon: number
    ): Promise<boolean> => {
        if (password !== repeatedPassword) {
            window.alert("Passwords don't match!")
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const res = await axios.post(`${process.env.SERVER_BACKEND}/user-account-manager/register-account`, {
                userName,
                userEmail,
                phoneNumber,
                password,
                sport,
                accountType,
                description,
                userBirthDate,
                locationLat,
                locationLon
            })

            if (res.data.error) {
                if (res.data.erromsg) {
                    window.alert(res.data.erromsg)
                    return false
                }
                window.alert('An error has occurred')
                return false
            }

            if (!res.data.error && res.data.userPrivateToken != null) {
                setCookie('userToken', res.data.userPrivateToken, { maxAge: 60 * 60 * 24 })
                setCookie('userPublicToken', res.data.userPublicToken, { maxAge: 60 * 60 * 24 })
                return true
            }

            return false
        } catch (err) {
            setError('An error has occurred')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { register, isLoading, error }
}

const useAccountLogin = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (userEmail: string, password: string): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await axios.post(`${process.env.SERVER_BACKEND}/user-account-manager/login-account`, {
                userEmail,
                password
            })

            if (!res.data.error && res.data.userPrivateToken != null) {
                setCookie('userToken', res.data.userPrivateToken, { maxAge: 60 * 60 * 24 })
                setCookie('userPublicToken', res.data.userPublicToken, { maxAge: 60 * 60 * 24 })
                return true
            }

            if (res.data.userPrivateToken === null) {
                window.alert('Incorrect credentials!')
            }

            return false
        } catch (err) {
            setError('An error has occurred')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}

const useAccountLogout = () => {
    const logout = () => {
        try {
            deleteCookie('userToken')
            deleteCookie('userPublicToken')
            window.location.reload()
        } catch (e) {
            console.log(`Logout error: ${e}`)
        }
    }

    return { logout }
}

const useAccountStatus = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

    const checkStatus = async () => {
        const userToken = getCookie('userToken')
        setIsLoggedIn(userToken !== undefined)
    }

    return { isLoggedIn, checkStatus }
}

const useAccountDelete = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteAccount = async (sure: boolean, UserPrivateToken: string): Promise<boolean> => {
        if (!sure) {
            window.alert('CheckBox Not Checked')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const res = await axios.post(`${process.env.SERVER_BACKEND}/user-account-manager/delete-user-account/`, { userToken: UserPrivateToken })

            if (res.data.error) {
                window.alert('Error')
                return false
            }

            return true
        } catch (err) {
            setError('An error has occurred')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { deleteAccount, isLoading, error }
}

export { useAccountRegister, useAccountLogin, useAccountLogout, useAccountStatus, useAccountDelete }
