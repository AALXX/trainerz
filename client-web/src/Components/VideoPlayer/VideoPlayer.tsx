'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getVideoData, IVideoData, playOrPauseVideo, likeVideo, dislikeVideo } from '@/Components/VideoPlayer/UtilFunc'
import { getCookie } from 'cookies-next'
import PlayerOverlay from './PlayerOverlay'
import axios from 'axios'
import { IVideoPlayerProps } from './CommentSection/IcommentSection'
import ImgWithAuth from '../CommonUi/ImageWithAuth'

/**
 * Main Video PLayer
 * @param {VideoPlayerProps} props
 * @return {JSX}
 */
const VideoPlayer = (props: IVideoPlayerProps) => {
    const VideoRef = useRef<HTMLVideoElement>(null)
    const [showOverlay, setShowOverlay] = useState(false)

    const [playing, setPlaying] = useState(false)
    const [Progress, setProgress] = useState(0)
    const [Volume, setVolume] = useState<number>(0.5)
    const [CurrentMinutes, setCurrentMinutes] = useState<number>(0)
    const [CurrentSeconds, setCurrentSeconds] = useState<number>(0)
    const [DurationMinutes, setDurationMinutes] = useState<number>(0)
    const [DurationSeconds, setDurationSeconds] = useState<number>(0)

    const allTimeWatchRef = useRef<number>(0)

    const [VideoData, setVideoData] = useState<IVideoData>({
        error: false,
        OwnerToken: '',
        PublishDate: '',
        VideoDescription: '',
        VideoTitle: '',
        AccountName: '',
        VideoLikes: 0,
        VideoDislikes: 0,
        UserLikedOrDislikedVideo: 0
    })

    const [userLikedVideo, setUserLikedVideo] = useState<boolean>(false)
    const [userDisLikedVideo, setUserDisLikedVideo] = useState<boolean>(false)
    const [videoLikes, setVideoLikes] = useState<number>(0)
    const [videoDisLikes, setVideoDisLikes] = useState<number>(0)

    useEffect(() => {
        if (props.VideoToken == null) {
            window.location.href = 'http://localhost:3000/'
        }

        ;(async () => {
            const videoData = await getVideoData(props.VideoToken, getCookie('userToken') as string)
            setVideoData(videoData)

            if (props.setPackageName && props.setPackageRating) {
                props.setPackageName(videoData.PackageName)
                props.setPackageRating(videoData.PackageRating)
            }

            if (videoData.UserLikedOrDislikedVideo.like_or_dislike === 1) {
                setUserLikedVideo(true)
            } else if (videoData.UserLikedOrDislikedVideo.like_or_dislike === 2) {
                setUserDisLikedVideo(true)
            }

            setVideoLikes(videoData.VideoLikes)
            setVideoDisLikes(videoData.VideoDislikes)
        })()

        const storageVolume = Number(localStorage.getItem('Volume'))

        setVolume(storageVolume)

        setTimeout(() => {
            if (VideoRef.current) {
                VideoRef.current.volume = storageVolume
            }

            if (VideoRef?.current?.paused) {
                setPlaying(true)
            } else {
                setPlaying(false)
            }
        }, 100)

        //* update method every 1 sec
        const VideoChecks = window.setInterval(() => {
            //* it updates progress bar
            if (VideoRef?.current?.duration != undefined) setProgress((VideoRef?.current?.currentTime / VideoRef?.current?.duration) * 100)

            //* it updates current and total minutes shown
            if (VideoRef?.current) {
                const currentTime = Math.floor(VideoRef.current.currentTime)
                const totalDuration = Math.floor(VideoRef.current.duration)

                const currentMinutes = Math.floor(currentTime / 60)
                const currentSeconds = currentTime % 60

                const totalMinutes = Math.floor(totalDuration / 60)
                const totalSeconds = totalDuration % 60

                setCurrentMinutes(currentMinutes)
                setCurrentSeconds(currentSeconds)

                setDurationMinutes(totalMinutes)
                setDurationSeconds(totalSeconds)
            }

            if (VideoRef?.current) {
                // Update allTimeWatch using the ref
                allTimeWatchRef.current = VideoRef?.current?.currentTime
            }

            if (VideoRef?.current?.duration === VideoRef?.current?.currentTime) {
                // setVideoEnded(true)
            }
        }, 1000)

        const sendVideoAnalitycs = async () => {
            if (Math.floor(allTimeWatchRef.current) > 3) {
                const resp = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/update-video-alalytics`, {
                    WatchTime: allTimeWatchRef.current,
                    UserPublicToken: getCookie('userToken'),
                    VideoToken: props.VideoToken
                })
                console.log(resp)
            }
        }

        return () => {
            clearInterval(VideoChecks)
            console.log(allTimeWatchRef.current)
            ;(async () => {
                await sendVideoAnalitycs()
            })()
        }
    }, [props.VideoToken])

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = (Number(e.target.value) / 100) * VideoRef.current!.duration
        VideoRef.current!.currentTime = newTime
        setProgress(Number(e.target.value))
    }

    return (
        // * PLayer Outer Border
        <div className="ml-[6rem] mt-[3rem] flex flex-col">
            {/*  VideoPlayer Border */}

            <div className="h-[71.8vh] w-[66.8vw] rounded-tl-xl">
                {/* TODO  make video controll bar */}
                {showOverlay ? (
                    <PlayerOverlay
                        Progress={Progress}
                        Playing={playing}
                        CurrentMinutes={CurrentMinutes}
                        CurrentSeconds={CurrentSeconds}
                        DurationMinutes={DurationMinutes}
                        DurationSeconds={DurationSeconds}
                        Volume={Volume}
                        setVolume={setVolume}
                        VideoRef={VideoRef}
                        playOrPauseVideo={playOrPauseVideo}
                        setPlaying={setPlaying}
                        handleProgressChange={handleProgressChange}
                        setShowOverlay={setShowOverlay}
                    />
                ) : null}

                <video
                    onClick={() => {
                        setPlaying(playOrPauseVideo(VideoRef))
                    }}
                    ref={VideoRef}
                    className="h-full w-full rounded-tl-xl bg-black"
                    onMouseEnter={() => {
                        setShowOverlay(true)
                    }}
                    onMouseLeave={() => {
                        setShowOverlay(false)
                    }}
                >
                    <source src={`${process.env.VIDEO_SERVER_BACKEND}/video-manager/video-stream/${props.VideoToken}`} type="video/mp4" />
                    <p>Your browser does not support the HTML5 Video element.</p>
                </video>
            </div>

            <div className="mt-[.5vh] flex h-[11vh] w-[66.8vw] rounded-bl-xl bg-[#00000080]">
                <Link className="ml-4 self-center" href={`/user?id=${VideoData.OwnerToken}`}>
                    <ImgWithAuth className="z-10 h-14 w-14 rounded-full" src={`${process.env.FILE_SERVER}/${VideoData.OwnerToken}/Main_icon.png?cache=none`} width={50} height={50} alt="Picture of the author" />
                </Link>
                <div className="ml-4 flex flex-col self-center">
                    <h1 className="mt-2 text-lg text-white">{VideoData.VideoTitle}</h1>
                    <hr className="w-full" />
                    <div className="flex">
                        <div className="flex flex-col">
                            <h1 className="text-base text-white">{VideoData.AccountName}</h1>
                        </div>
                    </div>
                </div>
                <div className="ml-auto mr-[2vw] flex">
                    {userLikedVideo ? (
                        <>
                            <img
                                src="/assets/PlayerIcons/Liked_icon.svg"
                                className="mr-[.5rem] w-[1.6rem] cursor-pointer"
                                alt="not muted image"
                                onClick={async () => {
                                    setUserDisLikedVideo(false)
                                    setVideoLikes(videoLikes - 1)

                                    setUserLikedVideo(await likeVideo(getCookie('userToken'), props.VideoToken, userLikedVideo, userDisLikedVideo))
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src="/assets/PlayerIcons/Like_icon.svg"
                                className="ml-auto mr-[.5rem] w-[1.6rem] cursor-pointer"
                                alt="not muted image"
                                onClick={async () => {
                                    setUserDisLikedVideo(false)
                                    setVideoLikes(videoLikes + 1)
                                    if (userDisLikedVideo) {
                                        setVideoDisLikes(videoDisLikes - 1)
                                    }

                                    setUserLikedVideo(await likeVideo(getCookie('userToken'), props.VideoToken, userLikedVideo, userDisLikedVideo))
                                }}
                            />
                        </>
                    )}

                    <h1 className="mr-[1.5rem] self-center text-white">{videoLikes}</h1>

                    {userDisLikedVideo ? (
                        <>
                            <img
                                src="/assets/PlayerIcons/Disliked_icon.svg"
                                className="ml-auto mr-[.5rem] w-[1.6rem] cursor-pointer"
                                alt="not muted image"
                                onClick={async () => {
                                    setUserLikedVideo(false)
                                    setVideoDisLikes(videoDisLikes - 1)

                                    setUserDisLikedVideo(await dislikeVideo(getCookie('userToken'), props.VideoToken, userLikedVideo, userDisLikedVideo))
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src="/assets/PlayerIcons/Dislike_icon.svg"
                                className="ml-auto mr-[.5rem] w-[1.6rem] cursor-pointer"
                                alt="not muted image"
                                onClick={async () => {
                                    setUserLikedVideo(false)
                                    setVideoDisLikes(videoDisLikes + 1)
                                    if (userLikedVideo) {
                                        setVideoLikes(videoLikes - 1)
                                    }
                                    setUserDisLikedVideo(await dislikeVideo(getCookie('userToken'), props.VideoToken, userLikedVideo, userDisLikedVideo))
                                }}
                            />
                        </>
                    )}
                    <h1 className="mr-[4rem] self-center text-white">{videoDisLikes}</h1>
                </div>
            </div>
        </div>
    )
}

/**
 * Video Player fallback
 * @return {JSX}
 */
function VideoPlayerFallback() {
    return <>placeholder</>
}

export { VideoPlayer, VideoPlayerFallback }
