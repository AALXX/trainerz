'use client'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { SetStateAction, useEffect, useRef, useState } from 'react'

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

const UploadComopnent = () => {
    //* Video attributes states
    const [videoTitle, setvideoTitle] = useState<string>('')
    const [videoVisibility, setvideoVisibility] = useState<string>('public')

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

    //* Uploads Video to server
    const uploadFile = async () => {
        if (videoFile![0] == null) {
            return window.alert('No Video file inputed')
        }

        const userToken: string = getCookie('userToken') as string

        console.log(videoFile![0])

        const formData = new FormData()
        formData.append('VideoFile', videoFile![0])
        formData.append('VideoThumbnail', thumbnalFile!)
        formData.append('VideoTitle', videoTitle)
        formData.append('VideoVisibility', videoVisibility)
        formData.append('UserPrivateToken', userToken)

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

        const maxFrame = videoRef.current?.duration // Maximum time in the video
        const scale = 0.21

        // Generate a random time in the video
        const randomTime = Math.random() * maxFrame
        videoRef.current.currentTime = 2 * 60
        const context = canvasRef.current.getContext('2d')

        // Draw the frame on the canvas
        context?.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth * scale * 1.12, videoRef.current.videoHeight * scale)
        // Convert the frame to a data URL (base64 image)
        const frameData = canvasRef.current.toDataURL('image/jpeg')
        // const thumbnailImage: SetStateAction<File | null> = UtilFunctions.dataURLtoFile(frameData, 'DefaultThumbnail.jpg')
        // Set the captured frames in the state
        setCapturedFrame(frameData)
        // setThumbnalFile(thumbnailImage)
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
            <div className="flex flex-row items-center w-[100%] h-[19rem] ">
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
                        accept=".mov,.mp4,.mkv"
                    />
                    <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="m-auto w-[7rem] h-[2rem]" />
                </label>
                <div className="flex w-[100%] h-[52%] flex-col items-center">
                    <div className="relative h-[1.2rem] w-[62%] bg-[#292929] m-auto overflow-x-hidden rounded">
                        <div className="absolute h-[100%] rounded bg-blue-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex flex-col items-center">
                        <input
                            className="bg-[#414141] border-hidden w-[20rem] text-white mt-[2vh] text-center"
                            type="text"
                            placeholder="Video Title"
                            onChange={e => {
                                setvideoTitle(e.target.value)
                            }}
                        />

                        <select name="videoVisibility" onChange={e => setvideoVisibility(e.target.value)} value={videoVisibility} className="w-[20rem] mt-[2vh] bg-[#414141] text-white border-hidden">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>

                        <button
                            className="text-white mt-5 bg-[#414141] w-[20rem]"
                            onClick={async () => {
                                await uploadFile()
                            }}
                        >
                            Upload
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

export default UploadComopnent
