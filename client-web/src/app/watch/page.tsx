'use client'
import React, { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { VideoPlayerFallback, VideoPlayer } from '@/Components/VideoPlayer/VideoPlayer'
import CommentSection from '@/Components/VideoPlayer/CommentSection/CommentSection'
import { useSearchParams } from 'next/navigation'
import useVideoSubscriptionCheck from '@/hooks/useSubscriptionCheck'

const VideoContent = () => {
    const urlParams = useSearchParams()
    const { subscriptionCheck, isLoading, error, subscribed } = useVideoSubscriptionCheck()
    const [packageName, setPackageName] = useState<string>('')
    const [packageRating, setPackageRating] = useState<number>(0)

    useEffect(() => {
        ;(async () => {
            if (urlParams.get('vt') != null) {
                await subscriptionCheck(urlParams.get('vt') as string)
            }
        })()
    }, [urlParams, subscriptionCheck])

    if (error) {
        return (
            <div>
                <h1 className="m-auto text-white">Error: {error}</h1>
            </div>
        )
    }

    if (!subscribed) {
        return (
            <div className="flex h-full flex-col">
                <h1 className="mt-5 self-center text-white">Not Subscribed to the package</h1>
            </div>
        )
    }

    return (
        <div className="flex h-full">
            <Suspense fallback={<VideoPlayerFallback />}>
                <VideoPlayer VideoToken={urlParams.get('vt')} setPackageName={setPackageName} setPackageRating={setPackageRating} />
            </Suspense>
            <Suspense
                fallback={
                    <div>
                        <h1>Loading</h1>
                    </div>
                }
            >
                <CommentSection VideoToken={urlParams.get('vt')} PackageName={packageName} PackageRating={packageRating} />
            </Suspense>
        </div>
    )
}

export default VideoContent
