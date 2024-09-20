import { useState } from 'react'
import axios from 'axios'
import { CookieValueTypes, getCookie } from 'cookies-next'

interface OwnerCheckResponse {
    error: boolean
    isOwner: boolean
}

const useOwnerCheck = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState<boolean | null>(null)

    const ownerCheck = async (profilePublicToken: CookieValueTypes): Promise<void> => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await axios.post<OwnerCheckResponse>(`${process.env.SERVER_BACKEND}/user-account-manager/account-owner-check`, {
                accountPrivateToken: getCookie('userToken'),
                accountPublicToken: getCookie('userPublicToken'),
                profilePublicToken
            })

            if (res.data.error) {
                setError('An error has occurred!')
                setIsOwner(false)
                window.alert('An error has occurred!')
            } else {
                setIsOwner(res.data.isOwner)
            }
        } catch (err) {
            setError('An error has occurred!')
            setIsOwner(false)
            window.alert('An error has occurred!')
        } finally {
            setIsLoading(false)
        }
    }

    return { ownerCheck, isLoading, error, isOwner }
}

export default useOwnerCheck
