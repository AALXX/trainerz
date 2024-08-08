import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { getCookie } from 'cookies-next'

interface SubscriptionCheckResponse {
    error: boolean
    subscribed: boolean
}

const WorkoutProgramCheck = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [subscribed, setSubscribed] = useState<boolean | null>(null)

    const subscriptionCheck = useCallback(async (VideoToken: string): Promise<void> => {
        setIsLoading(true)
        setError(null)

        const source = axios.CancelToken.source()
        const timeout = setTimeout(() => {
            source.cancel('Request timed out')
        }, 10000) // 10 second timeout

        try {
            const res = await axios.get<SubscriptionCheckResponse>(`${process.env.SERVER_BACKEND}/videos-manager/subscription-check/${VideoToken}/${getCookie('userToken')}`, { cancelToken: source.token })

            clearTimeout(timeout)
            if (res.data.error) {
                setError('An error occurred during subscription check.')
                setSubscribed(false)
            } else {
                setSubscribed(res.data.subscribed)
            }
        } catch (err) {
            clearTimeout(timeout)
            if (axios.isCancel(err)) {
                setError('Request timed out. Please try again.')
            } else {
                setError('An error occurred. Please try again.')
            }
            setSubscribed(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        return () => {
            // Clean up any ongoing requests or timeouts here if needed
        }
    }, [])

    return { subscriptionCheck, isLoading, error, subscribed }
}

export default WorkoutProgramCheck
