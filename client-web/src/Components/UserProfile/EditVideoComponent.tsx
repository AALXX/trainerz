import React, { Suspense, useEffect, useState } from 'react'
import { getCookie } from 'cookies-next'
import axios from 'axios'
import dynamic from 'next/dynamic'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import SelectableCards from './util/ProfileTabCards'
import OptionPicker from '../CommonUi/OptionPicker'
import ImgWithAuth from '../CommonUi/ImageWithAuth'
// import { IGraphType } from './utils/VideoAnalytics/VideoAnalytics'
// const VideoAnalytics = dynamic(() => import('./utils/VideoAnalytics/VideoAnalytics'), { ssr: false })

const EditVideoComponent = ({ videoToken }: { videoToken: string }) => {
    const [ToggleDeleteVideoPopup, setToggleDeleteVideoPopup] = useState<boolean>(false)

    const [componentToShow, setComponentToShow] = useState<string>('Thumbnails')
    const [videoTitle, setVideoTitle] = useState<string>('')
    const [publishDate, setPublishDate] = useState<string>('')
    const [videoVisibility, setVideoVisibility] = useState<string>('')
    const [videoLikes, setVideoLikes] = useState<number>(0)
    const [videoDislikes, setVideoDislikes] = useState<number>(0)
    const [videoOwnerToken, setVideoOwnerToken] = useState<string>('')
    const [showComments, setShowComments] = useState<boolean>(false)
    const [showLikesDislikes, setShowLikesDislikes] = useState<boolean>(false)
    const [videoViews, setVideoViews] = useState<number>(0)
    const [avrageWatchTime, setAvrageWatchTime] = useState<number>(0)
    const [sport, setSport] = useState<string>('')

    const [thumbnalFile, setThumbnalFile] = useState<File | null>(null)
    const [isHovered, setIsHovered] = useState<boolean>(false)
    const [videoNotFoundScreen, setVideoNotFoundScreen] = useState<boolean>(false)

    // const [videoHistoryData, setVideoHistoryData] = useState<Array<IGraphType>>([])

    let component

    useEffect(() => {
        ;(async () => {
            const res = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-creator-video-data/${getCookie('userToken')}/${videoToken}`)
            setVideoNotFoundScreen(res.data.error)
            setVideoTitle(res.data.VideoTitle)
            const formattedDate = new Date(res.data.PublishDate).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })

            setPublishDate(formattedDate)
            setVideoVisibility(res.data.VideoVisibility)
            setVideoLikes(res.data.VideoLikes)
            setVideoDislikes(res.data.VideoDislikes)
            setVideoOwnerToken(res.data.OwnerToken)
            setShowComments(res.data.ShowComments)
            setShowLikesDislikes(res.data.ShowLikesDislikes)
            setSport(res.data.Sport)
            setVideoViews(res.data.Views)
            setAvrageWatchTime(res.data.AvrageWatchTime)

            // const histres = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-video-history-data/${getCookie('userToken')}/${videoToken}`)
            // setVideoHistoryData(histres.data.VideoHistoryData)
        })()
    }, [])

    const updateVideoData = async () => {
        const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/update-creator-video-data`, {
            VideoTitle: videoTitle,
            VideoVisibility: videoVisibility,
            Sport: sport,
            VideoToken: videoToken,
            UserPrivateToken: getCookie('userToken')
        })

        if (res.data.error === true) {
            return window.alert('Sorry, an error has ocured')
        } else if (res.data.error === false) {
            return window.alert('Succesfully Updated')
        }
    }

    const deleteVideo = async () => {
        const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/delete-video`, {
            VideoToken: videoToken,
            UserPrivateToken: getCookie('userToken')
        })

        if (res.data.error === true) {
            return window.alert('Sorry, an error has ocured')
        } else {
            return window.alert('Succesfully Deleted')
        }
    }

    const changeVideoThumbnail = async () => {
        if (thumbnalFile == null) {
            return window.alert('No Video file inputed')
        }

        const userToken: string = getCookie('userToken') as string

        const formData = new FormData()
        formData.append('VideoThumbnail', thumbnalFile!)
        formData.append('UserPrivateToken', userToken)
        formData.append('VideoToken', videoToken as string)

        const config = {
            headers: { 'content-type': 'multipart/formdata' }
        }

        const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/change-thumbnail`, formData, config)

        if (res.data.error === true) {
            return window.alert('Sorry, an error has ocured')
        } else {
            return window.alert('Succesfully Changed thumbnail')
        }
    }

    switch (componentToShow) {
        case 'Thumbnails':
            if (thumbnalFile !== null) {
                component = (
                    <div className="flex h-[11rem] w-[15rem] flex-col">
                        <label
                            htmlFor="thumbnailFile"
                            className="flex h-[9rem] w-full cursor-pointer flex-col border-2 border-solid border-white"
                            onMouseEnter={() => {
                                setIsHovered(true)
                            }}
                            onMouseLeave={() => {
                                setIsHovered(false)
                            }}
                        >
                            {isHovered ? (
                                <div className="absolute flex h-[8.5rem] w-[14.5rem] flex-col">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="thumbnailFile"
                                        onChange={e => {
                                            setThumbnalFile(e.target.files![0])
                                        }}
                                    />
                                    <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="mt-11 h-[2rem] w-[7rem] self-center" />

                                    <h1 className="self-center text-[1rem] text-white">upload thumbnail</h1>
                                </div>
                            ) : null}

                            <img src={URL.createObjectURL(thumbnalFile)} alt="AccountImageButton" className="h-full w-full" />
                        </label>
                        <button
                            className="mt-auto w-full cursor-pointer bg-[#414141] text-white"
                            onClick={async () => {
                                await changeVideoThumbnail()
                            }}
                        >
                            Update
                        </button>
                    </div>
                )
            } else {
                component = (
                    <label
                        htmlFor="thumbnailFile"
                        className="flex h-[9rem] w-[15rem] cursor-pointer flex-col border-2 border-solid border-white"
                        onMouseEnter={() => {
                            setIsHovered(true)
                        }}
                        onMouseLeave={() => {
                            setIsHovered(false)
                        }}
                    >
                        <ImgWithAuth
                            src={`${process.env.FILE_SERVER}/${videoOwnerToken}/${videoToken}/Thumbnail_image.jpg`}
                            alt={`Frame`}
                            className="mt-auto h-[9rem] w-[15rem] cursor-pointer border-2 border-solid border-white"
                        />
                        {isHovered ? (
                            <div className="absolute ml-[0.12rem] mt-1 flex h-[8.3rem] w-[14.5rem] flex-col bg-[#0000005b]">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="thumbnailFile"
                                    onChange={e => {
                                        setThumbnalFile(e.target.files![0])
                                    }}
                                />
                                <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="mt-11 h-[2rem] w-[7rem] self-center" />
                                <h1 className="self-center text-[1rem] text-white">upload thumbnail</h1>
                            </div>
                        ) : null}
                    </label>
                )
            }
            break
        case 'Analytics':
            component = (
                <Suspense fallback={<div>Loading...</div>}>
                    {/* <VideoAnalytics AvrageTime={avrageWatchTime} VideoViews={videoViews} Dislikes={videoDislikes} Likes={videoLikes} PublishDateFormated={publishDate} videoHistoryData={videoHistoryData} /> */}
                </Suspense>
            )

            break
        case 'editor':
            component = <></>
            break
        default:
            component = <div>No matching component found</div>
    }

    if (videoNotFoundScreen) {
        return <>video Not Found</>
    }

    return (
        <>
            <div className="flex">
                <div className="ml-10 mt-10 flex h-[13rem] w-[22rem] bg-[#ffffff]">
                    <ImgWithAuth src={`${process.env.FILE_SERVER}/${videoOwnerToken}/${videoToken}/Thumbnail_image.jpg`} className="h-full w-full" />
                </div>

                <div className="m-auto mt-10">
                    <form
                        className="flex flex-col items-center"
                        onSubmit={async e => {
                            e.preventDefault()
                            await updateVideoData()
                        }}
                    >
                        <input
                            className="h-10 w-full rounded-xl border-none bg-[#474084] indent-3 text-white placeholder:text-white"
                            type="text"
                            placeholder="Video title"
                            onChange={e => {
                                setVideoTitle(e.target.value)
                            }}
                            value={videoTitle}
                        />
                        <div className="mt-4 flex w-full flex-col self-center">
                            <h1 className="h1-sm text-white">Video Visibility</h1>
                            <OptionPicker label="Video Visibility" options={['Public', 'Private']} value={videoVisibility} onChange={value => setVideoVisibility(value)} />
                        </div>
                        <div className="flex w-full flex-col self-center">
                            <h1 className="h1-sm text-white">Video Sport</h1>
                            <OptionPicker
                                label="Video Visibility"
                                options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                                value={sport}
                                onChange={value => setSport(value)}
                            />
                        </div>
                        <button className="mb-4 mt-2 h-10 w-full justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={async () => await updateVideoData()}>
                            <h1 className="self-center text-lg text-white">Upload Video!</h1>
                        </button>
                    </form>

                    <button
                        className="h-10 w-[25rem] cursor-pointer rounded-xl bg-[#961a1a] text-white"
                        onClick={() => {
                            setToggleDeleteVideoPopup(!ToggleDeleteVideoPopup)
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
            {ToggleDeleteVideoPopup ? (
                <PopupCanvas
                    closePopup={() => {
                        setToggleDeleteVideoPopup(!ToggleDeleteVideoPopup)
                    }}
                >
                    <div className="flex flex-col">
                        <h1 className="self-center text-xl text-white">Are you sure you want to delete the video</h1>

                        <button
                            className="mt-5 w-[25rem] cursor-pointer bg-[#961a1a] text-white"
                            onClick={async () => {
                                await deleteVideo()
                            }}
                        >
                            Yes
                        </button>
                    </div>
                </PopupCanvas>
            ) : null}
            <div className="mt-12 flex items-center">
                <SelectableCards
                    Title="THUMBNALS"
                    TabName="Thumbnails"
                    activeTab={componentToShow}
                    setComponentToShow={setComponentToShow}
                    className="ml h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                />
                <SelectableCards
                    Title="ANALYTICS"
                    TabName="Analytics"
                    setComponentToShow={setComponentToShow}
                    className="ml h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                    activeTab={componentToShow}
                />
                <SelectableCards
                    Title="EDITOR"
                    TabName="editor"
                    setComponentToShow={setComponentToShow}
                    className="ml h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                    activeTab={componentToShow}
                />
            </div>
            <hr className="w-[100%]" />
            <div className="mt-[2vh] flex h-full w-[95%] self-center">{component}</div>
        </>
    )
}

export default EditVideoComponent
