import React, { Suspense, useEffect, useState } from 'react'
import { getCookie } from 'cookies-next'
import axios from 'axios'
import dynamic from 'next/dynamic'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import SelectableCards from './util/ProfileTabCards'
import OptionPicker from '../CommonUi/OptionPicker'
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
                    <div className="flex flex-col w-[15rem] h-[11rem] ">
                        <label
                            htmlFor="thumbnailFile"
                            className="flex flex-col border-2 border-white border-solid w-full h-[9rem] cursor-pointer "
                            onMouseEnter={() => {
                                setIsHovered(true)
                            }}
                            onMouseLeave={() => {
                                setIsHovered(false)
                            }}
                        >
                            {isHovered ? (
                                <div className="flex flex-col absolute h-[8.5rem]  w-[14.5rem]">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="thumbnailFile"
                                        onChange={e => {
                                            setThumbnalFile(e.target.files![0])
                                        }}
                                    />
                                    <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="self-center mt-11 w-[7rem] h-[2rem]" />

                                    <h1 className="text-white text-[1rem] self-center">upload thumbnail</h1>
                                </div>
                            ) : null}

                            <img src={URL.createObjectURL(thumbnalFile)} alt="AccountImageButton" className=" w-full h-full " />
                        </label>
                        <button
                            className="text-white bg-[#414141] w-full mt-auto cursor-pointer"
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
                        className="flex flex-col border-2 border-white border-solid w-[15rem] h-[9rem]  cursor-pointer "
                        onMouseEnter={() => {
                            setIsHovered(true)
                        }}
                        onMouseLeave={() => {
                            setIsHovered(false)
                        }}
                    >
                        <img
                            src={`${process.env.FILE_SERVER}/${videoOwnerToken}/${videoToken}/Thumbnail_image.jpg`}
                            alt={`Frame`}
                            className="border-2 border-white border-solid w-[15rem] h-[9rem] mt-auto cursor-pointer"
                        />
                        {isHovered ? (
                            <div className="flex flex-col absolute bg-[#0000005b] h-[8.3rem]  w-[14.5rem] mt-1 ml-[0.12rem]">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="thumbnailFile"
                                    onChange={e => {
                                        setThumbnalFile(e.target.files![0])
                                    }}
                                />
                                <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="self-center mt-11 w-[7rem] h-[2rem]" />
                                <h1 className="text-white text-[1rem] self-center">upload thumbnail</h1>
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
                <div className="flex bg-[#ffffff] w-[22rem] h-[13rem]  mt-10 ml-10">
                    <img src={`${process.env.FILE_SERVER}/${videoOwnerToken}/${videoToken}/Thumbnail_image.jpg`} className="w-full h-full" />
                </div>

                <div className="mt-10 m-auto">
                    <form
                        className="flex flex-col items-center"
                        onSubmit={async e => {
                            e.preventDefault()
                            await updateVideoData()
                        }}
                    >
                        <input
                            className="text-white  bg-[#474084] h-10 border-none rounded-xl w-full placeholder:text-white indent-3"
                            type="text"
                            placeholder="Video title"
                            onChange={e => {
                                setVideoTitle(e.target.value)
                            }}
                            value={videoTitle}
                        />
                        <div className="flex w-full flex-col self-center  mt-4">
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
                        <button className="self-center w-full h-10 bg-[#474084] active:bg-[#3b366c]  mb-4 mt-2  justify-center rounded-xl" onClick={async () => await updateVideoData()}>
                            <h1 className="self-center text-white text-lg">Upload Video!</h1>
                        </button>
                    </form>

                    <button
                        className="text-white  bg-[#961a1a] h-10 w-[25rem] cursor-pointer rounded-xl"
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
                        <h1 className="text-white self-center text-xl">Are you sure you want to delete the video</h1>

                        <button
                            className="text-white mt-5 bg-[#961a1a] w-[25rem] cursor-pointer"
                            onClick={async () => {
                                await deleteVideo()
                            }}
                        >
                            Yes
                        </button>
                    </div>
                </PopupCanvas>
            ) : null}
            <div className="flex items-center mt-12">
                <SelectableCards Title="THUMBNALS" TabName="Thumbnails" setComponentToShow={setComponentToShow} />
                <SelectableCards Title="ANALYTICS" TabName="Analytics" setComponentToShow={setComponentToShow} />
                <SelectableCards Title="EDITOR" TabName="editor" setComponentToShow={setComponentToShow} />
            </div>
            <hr className="w-[100%]" />
            <div className="flex w-[95%] mt-[2vh] self-center h-full">{component}</div>
        </>
    )
}

export default EditVideoComponent
