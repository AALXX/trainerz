import axios from 'axios'
import { CookieValueTypes } from 'cookies-next'
import { RefObject } from 'react'

interface IVideoData {
    error: boolean
    VideoTitle: string
    VideoDescription: string
    PublishDate: string
    OwnerToken: string
    AccountName: string
    AccountFolowers: string
    UserFollwsAccount: boolean
    VideoLikes: number
    VideoDislikes: number
    UserLikedOrDislikedVideo: number
}

const getVideoData = async (VideoToken: string | null, userToken: string) => {
    const videoData = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-video-data/${VideoToken}/${userToken}`)
    console.log(videoData)
    return {
        error: false,
        VideoTitle: videoData.data.videotitle,
        VideoDescription: videoData.data.videodescription,
        PublishDate: videoData.data.publishdate,
        OwnerToken: videoData.data.ownertoken,
        AccountName: videoData.data.accountname,
        AccountFolowers: videoData.data.accountfolowers,
        UserFollwsAccount: videoData.data.UserFollwsAccount,
        VideoLikes: videoData.data.likes,
        VideoDislikes: videoData.data.dislikes,
        UserLikedOrDislikedVideo: videoData.data.UserLikedOrDislikedVideo
    }
}

//* Play/Pause
const playOrPauseVideo = (videoRef: RefObject<HTMLVideoElement>): boolean => {
    if (videoRef?.current?.paused) {
        videoRef?.current?.play()
        return true
    } else {
        videoRef?.current?.pause()
        return false
    }
}

//* volume
const changeVolume = (videoRef: RefObject<HTMLVideoElement>, e: any) => {
    if (videoRef?.current?.volume) {
        videoRef.current.volume = e.target.value
    }

    localStorage.setItem('Volume', e.target.value)
    return e.target.value
}

const followAccount = async (usrToken: CookieValueTypes, ownerToken: string, userFollwsAccount: boolean) => {
    if (usrToken === ownerToken || usrToken == undefined || ownerToken == undefined) {
        return false
    }
    await axios.post(`${process.env.SERVER_BACKEND}/user-account/follow`, { userPrivateToken: usrToken, accountToken: ownerToken })
    return !userFollwsAccount
}

const likeVideo = async (usrToken: CookieValueTypes, videoToken: string | null, userLikedVideo: boolean, userDisLikedVideo: boolean) => {
    if (videoToken == null) {
        return false
    }

    if ((!userLikedVideo && !userDisLikedVideo) || (!userLikedVideo && userDisLikedVideo)) {
        await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/like-dislike-video`, { UserPublicToken: usrToken, videoToken: videoToken, likeOrDislike: 1 })
    } else if (userLikedVideo) {
        await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/like-dislike-video`, { UserPublicToken: usrToken, videoToken: videoToken, likeOrDislike: 0 })
    }

    return !userLikedVideo
}

const dislikeVideo = async (usrToken: CookieValueTypes, videoToken: string | null, userLikedVideo: boolean, userDisLikedVideo: boolean) => {
    if (videoToken == null) {
        return false
    }

    if ((!userLikedVideo && !userDisLikedVideo) || (userLikedVideo && !userDisLikedVideo)) {
        await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/like-dislike-video`, { UserPublicToken: usrToken, videoToken: videoToken, likeOrDislike: 2 })
    } else if (userDisLikedVideo) {
        await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/like-dislike-video`, { UserPublicToken: usrToken, videoToken: videoToken, likeOrDislike: 0 })
    }

    return !userDisLikedVideo
}

export type { IVideoData }
export { getVideoData, playOrPauseVideo, changeVolume, followAccount, likeVideo, dislikeVideo }
