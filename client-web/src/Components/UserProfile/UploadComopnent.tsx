'use client'
import OptionPicker from '@/Components/CommonUi/OptionPicker'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { useEffect, useRef, useState } from 'react'
import { captureFrame } from '@/Components/UserProfile/util/UploadVideoUtils'
import DoubleValueOptionPicker from '../CommonUi/DoubleValueOptionPicker'

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
            <div className="mt-4 flex h-[15rem] w-[25rem] flex-col border-2 border-white">
                <h1 className="m-auto text-[1.3rem] text-white">No video Inputed</h1>
            </div>
        )
    }

    return (
        <video ref={videoRef} controls className="mt-4 h-[15rem] w-[25rem] border-2 border-white">
            <source src={url} />
        </video>
    )
}

const UploadComponent = () => {
    //* Video attributes states
    const [videoTitle, setvideoTitle] = useState<string>('')
    const [price, setPrice] = useState(0)
    const [customPrice, setCustomPrice] = useState<boolean>(false)
    const [videoWidth, setVideoWidth] = useState<number>(0)
    const [videoHeight, setVideoHeight] = useState<number>(0)
    const [sport, setSport] = useState<string>('')

    const [packages, setPackages] = useState<{ name: string; token: string }[]>([])
    const [selectedPackageToken, setSelectedPackageToken] = useState<string>('')

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

        ;(async () => {
            const packagesresp = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-account-packages/${getCookie('userPublicToken')}`)

            const packagesList = packagesresp.data.packagesData.map((item: { packagename: string; packagetoken: string }) => ({
                name: item.packagename,
                token: item.packagetoken
            }))

            setPackages(packagesList)
        })()

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
        formData.append('PackageToken', selectedPackageToken)
        formData.append('VideoTitle', videoTitle)
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
                className="mt-auto flex h-[9rem] w-[15rem] cursor-pointer flex-col border-2 border-solid border-white"
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
        )
    } else {
        ThumbnaiComponent = (
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
                <img src={capturedFrame} alt={`Frame`} className="mt-auto h-[9rem] w-[15rem] cursor-pointer border-2 border-solid border-white" />
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

    return (
        <div className="flex h-full flex-col items-center">
            <div className="flex h-[24rem] w-[100%] flex-row items-center">
                <label htmlFor="VideoFile" className="ml-[3vw] flex h-[10rem] w-[20rem] cursor-pointer border-2 border-solid border-white">
                    <input
                        type="file"
                        className="hidden"
                        id="VideoFile"
                        onChange={e => {
                            setvideoFile(e.target.files)
                            previewVideo(e)
                            setProgress(0)
                            setTimeout(() => {
                                captureFrame(videoRef, canvasRef, setCapturedFrame, setThumbnalFile)
                            }, 300)
                        }}
                        accept=".mov, .mp4, .mkv"
                    />
                    <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="m-auto h-[2rem] w-[7rem]" />
                </label>
                <div className="flex w-[100%] flex-col items-center">
                    <div className="relative m-auto h-[1.2rem] w-[60%] overflow-x-hidden rounded bg-[#292929]">
                        <div className="absolute h-[100%] rounded bg-blue-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex w-[60%] flex-col items-center">
                        <input
                            className="mt-4 h-10 w-full rounded-xl border-none bg-[#474084] indent-3 text-white placeholder:text-white"
                            type="text"
                            placeholder="Video title"
                            onChange={e => {
                                setvideoTitle(e.target.value)
                            }}
                            value={videoTitle}
                        />
                        <div className="mt-2 flex w-full flex-col self-center">
                            <h1 className="h1-sm text-white">Course Package </h1>
                            <DoubleValueOptionPicker
                                label="Course Package"
                                options={packages.map(pkg => ({ label: pkg.name, value: pkg.token }))}
                                value={selectedPackageToken}
                                onChange={value => setSelectedPackageToken(value)}
                            />
                        </div>
                        <button className="mb-4 mt-2 h-10 w-full justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={async () => await uploadFile()}>
                            <h1 className="self-center text-lg text-white">Upload Video!</h1>
                        </button>
                    </div>
                </div>
            </div>

            <hr color="#7c7c7c" className="w-[95%]" />

            <div className="flex w-[95%]">
                <div className="flex flex-col">
                    <h1 className="mt-4 text-[1.3rem] text-white">Preview:</h1>
                    <Clip url={ObjectUrl} videoRef={videoRef} canvasRef={canvasRef} />
                </div>

                {videoFile == null ? null : (
                    <div className="ml-[10rem] mt-auto">
                        <h1 className="mt-4 text-[1.3rem] text-white">Thumbnail:</h1>
                        {ThumbnaiComponent}
                    </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>
    )
}

export default UploadComponent
