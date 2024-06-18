'use client'
import React, { useState } from 'react'
import { Suspense } from 'react'
import { VideoPlayerFallback, VideoPlayer } from '@/Components/VideoPlayer/VideoPlayer'
import CommentSection from '@/Components/VideoPlayer/CommentSection/CommentSection'
import { useSearchParams } from 'next/navigation'
import { getCookie } from 'cookies-next'
import { VideosList } from '@/Components/VideoPlayer/NextVideoList/VideosList'

/**
 * watch video page
 * @return {JSX}
 */
export default function WatchVideoPage() {
    const urlParams = useSearchParams() //* vt = Video Token
    const userToken: string = getCookie('userToken') as string

    const [packageName, setPackageName] = useState<string>('')
    const [packageRating, setPackageRating] = useState<number>(0)

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-full">
                <Suspense fallback={<VideoPlayerFallback />}>
                    <VideoPlayer VideoToken={urlParams.get('vt')} setPackageName={setPackageName} setPackageRating={setPackageRating} />
                </Suspense>
                <CommentSection VideoToken={urlParams.get('vt')} PacakageName={packageName} PackageRating={packageRating} />
            </div>
            {/* <div className=" w-full">
                <VideosList />
            </div> */}
        </div>
    )
}
