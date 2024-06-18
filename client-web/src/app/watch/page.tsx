'use client'
import React, { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { VideoPlayerFallback, VideoPlayer } from '@/Components/VideoPlayer/VideoPlayer'
import CommentSection from '@/Components/VideoPlayer/CommentSection/CommentSection'
import { useSearchParams } from 'next/navigation'
import { getCookie } from 'cookies-next'
import { VideosList } from '@/Components/VideoPlayer/NextVideoList/VideosList'
import useViodeoSubscriptionCheck from '@/hooks/useSubscriptionCheck'

/**
 * watch video page
 * @return {JSX}
 */
export default function WatchVideoPage() {
    const urlParams = useSearchParams() //* vt = Video Token

    const { subscriptionCheck, isLoading, error, subscribed } = useViodeoSubscriptionCheck()

    const [packageName, setPackageName] = useState<string>('')
    const [packageRating, setPackageRating] = useState<number>(0)

    useEffect(() => {
        (async () => {
            if (urlParams.get('vt')!= null) {
                await subscriptionCheck(urlParams.get('vt') as string)
            }
        })()
    }, [])
    
    return (
        <div className="flex h-full flex-col">
            {subscribed ? (
                <div className="flex h-full">
                    <Suspense fallback={<VideoPlayerFallback />}>
                        <VideoPlayer VideoToken={urlParams.get('vt')} setPackageName={setPackageName} setPackageRating={setPackageRating} />
                    </Suspense>
                    <CommentSection VideoToken={urlParams.get('vt')} PacakageName={packageName} PackageRating={packageRating} />
                </div>
            ) : (
                <div className='flex h-full flex-col'>
                    <h1 className="mt-5 text-white self-center">Not Subscribed</h1>
                </div>
            )}
            {/* <div className=" w-full">
                <VideosList />
            </div> */}
        </div>
    )
}
