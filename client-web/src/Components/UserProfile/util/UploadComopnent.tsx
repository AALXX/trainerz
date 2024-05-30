'use client'
import OptionPicker from '@/Components/CommonUi/OptionPicker'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { useEffect, useRef, useState } from 'react'

interface IClipProps {
    url: string
    videoRef: React.RefObject<HTMLVideoElement>
    canvasRef: React.RefObject<HTMLCanvasElement>
}

//* Video PriviewComponent
const Clip = ({ url, videoRef, canvasRef }: IClipProps) => {
    const previousUrl = useRef(url)

    useEffect(() => {
        if (previousUrl.current === url) {
            return
        }

        if (videoRef.current != null) {
            videoRef.current.load()
        }

        previousUrl.current = url
    }, [url])

    if (url == '') {
        return (
            <div className="flex border-2 border-white w-[25rem] h-[15rem] flex-col mt-4">
                <h1 className="text-white text-[1.3rem] m-auto">No video Inputed</h1>
            </div>
        )
    }

    return (
        <video ref={videoRef} controls className="border-white w-[25rem] h-[15rem] border-2 mt-4">
            <source src={url} />
        </video>
    )
}

const UploadComponent = () => {
    //* Video attributes states
    const [videoTitle, setvideoTitle] = useState<string>('')
    const [videoVisibility, setvideoVisibility] = useState<string>('public')
    const [price, setPrice] = useState(0)
    const [customPrice, setCustomPrice] = useState<boolean>(false)
    const [videoWidth, setVideoWidth] = useState<number>(0)
    const [videoHeight, setVideoHeight] = useState<number>(0)
    const [sport, setSport] = useState<string>('')

    //* Video object states
    const [videoFile, setvideoFile] = useState<FileList | null>(null)
    const [thumbnalFile, setThumbnalFile] = useState<File | null>(null)
    const [ObjectUrl, setObjectUrl] = useState<string>('')

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [capturedFrame, setCapturedFrame] = useState<string>('')

    const [isHovered, setIsHovered] = useState<boolean>(false)

    let ThumbnaiComponent

    //* Upload Progress State
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleLoadedMetadata = () => {
            if (videoRef.current) {
                setVideoWidth(videoRef.current.videoWidth)
                setVideoHeight(videoRef.current.videoHeight)
            }
        }

        const videoElement = videoRef.current
        if (videoElement) {
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
            }
        }
    }, [ObjectUrl])

    const dataURLtoFile = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',')
        const mime = arr[0].match(/:(.*?);/)![1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], filename, { type: mime })
    }

    //* Uploads Video to server
    const uploadFile = async () => {
        if (videoFile![0] == null) {
            return window.alert('No Video file inputed')
        }

        const userToken: string = getCookie('userToken') as string


        const formData = new FormData()
        formData.append('VideoFile', videoFile![0])
        formData.append('VideoThumbnail', thumbnalFile!)
        formData.append('VideoSport', sport)
        formData.append('width', videoWidth.toString())
        formData.append('height', videoHeight.toString())
        formData.append('VideoTitle', videoTitle)
        formData.append('VideoVisibility', videoVisibility)
        formData.append('UserPrivateToken', userToken)
        if (customPrice) {
            formData.append('Price', price.toString())
        } else {
            formData.append('Price', '0')
        }

        const config = {
            headers: { 'content-type': 'multipart/formdata' },
            onUploadProgress: (progressEvent: any) => {
                let percent = 0
                const { loaded, total } = progressEvent
                percent = Math.floor((loaded * 100) / total) //* set percent
                if (percent <= 100) {
                    setProgress(percent)
                }
            }
        }

        try {
            const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/upload-video`, formData, config)
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    }

    const captureFrame = () => {
        // Ensure the video and canvas elements are loaded
        if (!videoRef.current || !canvasRef.current) return

        const maxFrame = videoRef.current.duration // Maximum time in the video
        const randomTime = Math.random() * maxFrame // Generate a random time in the video

        videoRef.current.currentTime = randomTime // Seek to the random time

        videoRef.current.onseeked = () => {
            const context = canvasRef.current!.getContext('2d')
            const scale = 0.21

            // Draw the frame on the canvas
            context?.drawImage(videoRef.current!, 0, 0, videoRef.current!.videoWidth * scale * 1.12, videoRef.current!.videoHeight * scale)
            // Convert the frame to a data URL (base64 image)
            const frameData = canvasRef.current!.toDataURL('image/jpeg')
            // Convert the data URL to a File object
            const thumbnailImage = dataURLtoFile(frameData, 'thumbnail.jpg')
            // Set the captured frame and thumbnail file in the state
            setCapturedFrame(frameData)
            setThumbnalFile(thumbnailImage)
        }
    }

    // *Creates a Url for preview video
    const previewVideo = (e: any) => {
        e.preventDefault()
        if (e.target != null) {
            setObjectUrl(URL.createObjectURL(e.target.files[0]))
        }
    }

    if (thumbnalFile !== null) {
        ThumbnaiComponent = (
            <label
                htmlFor="thumbnailFile"
                className="flex flex-col border-2 border-white border-solid w-[15rem] h-[9rem] mt-auto  cursor-pointer "
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
        )
    } else {
        ThumbnaiComponent = (
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
                <img src={capturedFrame} alt={`Frame`} className="border-2 border-white border-solid w-[15rem] h-[9rem] mt-auto cursor-pointer" />
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

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-row items-center w-[100%] h-[24rem] ">
                <label htmlFor="VideoFile" className="flex border-2 border-white border-solid w-[20rem] h-[10rem] ml-[3vw] cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        id="VideoFile"
                        onChange={e => {
                            setvideoFile(e.target.files)
                            previewVideo(e)
                            setProgress(0)
                            setTimeout(() => {
                                captureFrame()
                            }, 300)
                        }}
                        accept=".mov, .mp4, .mkv"
                    />
                    <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="m-auto w-[7rem] h-[2rem]" />
                </label>
                <div className="flex w-[100%]  flex-col items-center">
                    <div className="relative h-[1.2rem] w-[60%] bg-[#292929] m-auto overflow-x-hidden rounded">
                        <div className="absolute h-[100%] rounded bg-blue-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex flex-col items-center w-[60%]">
                        <input
                            className="text-white mt-4 bg-[#474084] h-10 border-none rounded-xl w-full placeholder:text-white indent-3"
                            type="text"
                            placeholder="Video title"
                            onChange={e => {
                                setvideoTitle(e.target.value)
                            }}
                            value={videoTitle}
                        />

                        <div className="flex w-full flex-col self-center  mt-4">
                            <h1 className="h1-sm text-white">Video Visibility</h1>
                            <OptionPicker label="Video Visibility" options={['Public', 'Private']} value={videoVisibility} onChange={value => setvideoVisibility(value)} />
                        </div>
                        <div className="flex w-full flex-col self-center  mt-2">
                            <h1 className="h1-sm text-white">Video Sport</h1>
                            <OptionPicker
                                label="Video Sport"
                                options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                                value={sport}
                                onChange={value => setSport(value)}
                            />
                        </div>
                        <button className="self-center w-full h-10 bg-[#474084] active:bg-[#3b366c]  mb-4 mt-2  justify-center rounded-xl" onClick={async () => await uploadFile()}>
                            <h1 className="self-center text-white text-lg">Upload Video!</h1>
                        </button>
                    </div>
                </div>
            </div>

            <hr color="#7c7c7c" className="w-[95%]" />

            <div className="flex w-[95%]">
                <div className="flex flex-col ">
                    <h1 className="text-white text-[1.3rem] mt-4">Preview:</h1>
                    <Clip url={ObjectUrl} videoRef={videoRef} canvasRef={canvasRef} />
                </div>

                {videoFile == null ? null : (
                    <div className="mt-auto ml-[10rem]">
                        <h1 className="text-white text-[1.3rem] mt-4">Thumbnail:</h1>
                        {ThumbnaiComponent}
                    </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>
    )
}

export default UploadComponent
