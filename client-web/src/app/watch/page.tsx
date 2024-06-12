'use client'
import React from 'react'
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

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-full">
                <Suspense fallback={<VideoPlayerFallback />}>
                    <VideoPlayer VideoToken={urlParams.get('vt')} />
                </Suspense>
                <CommentSection VideoToken={urlParams.get('vt')} UserPrivateToken={userToken} />
            </div>
            {/* <div className=" w-full">
                <VideosList />
            </div> */}
        </div>
    )
}
