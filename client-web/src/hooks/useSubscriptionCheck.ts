import { useState } from 'react'
import axios from 'axios'
import { getCookie } from 'cookies-next'

interface SubscriptionCheckResponse {
    error: boolean
    subscribed: boolean
}

const useViodeoSubscriptionCheck = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [subscribed, setSubscribed] = useState<boolean | null>(null)

    const subscriptionCheck = async (VideoToken: string): Promise<void> => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await axios.get<SubscriptionCheckResponse>(`${process.env.SERVER_BACKEND}/videos-manager/subscription-check/${VideoToken}/${getCookie('userToken')}`)

            if (res.data.error) {
                setError('An error has occurred!')
                setSubscribed(false)
                window.alert('An error has occurred!')
            } else {
                setSubscribed(res.data.subscribed)
            }
        } catch (err) {
            setError('An error has occurred!')
            setSubscribed(false)
            window.alert('An error has occurred!')
        } finally {
            setIsLoading(false)
        }
    }

    return { subscriptionCheck, isLoading, error, subscribed }
}

export default useViodeoSubscriptionCheck
