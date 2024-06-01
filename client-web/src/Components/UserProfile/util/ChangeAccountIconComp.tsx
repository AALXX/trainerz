'use client'
import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { getCookie } from 'cookies-next'

interface IconProps {
    url: string
}

//* Icon Priview Component
const Icon = ({ url }: IconProps) => {
    const previousUrl = useRef(url)

    useEffect(() => {
        if (previousUrl.current === url) {
            return
        }

        previousUrl.current = url
    }, [url])

    if (url == '') {
        return (
            <div className="flex border-2 border-white h-[10rem] w-[10rem] flex-col rounded-full m-auto">
                <h1 className="text-white text-sm m-auto">No image Inputed</h1>
            </div>
        )
    }

    return <img src={url} alt="" className="rounded-full h-[10rem] w-[10rem] m-auto" />
}

const ChangeAccountIconComp = () => {
    //* Video object states
    const [iconFile, setIconFile] = useState<FileList | null>(null)
    const [ObjectUrl, setObjectUrl] = useState<string>('')

    // *Creates a Url for preview video
    const previewIcon = (e: any) => {
        e.preventDefault()
        setObjectUrl(URL.createObjectURL(e.target.files[0]))
    }

    const changeIconSubmit = () => {
        if (iconFile![0] == null) {
            return window.alert('No Video file inputed')
        }
        const formData = new FormData()
        formData.append('photo', iconFile![0])
        formData.append('UserPrivateToken', getCookie('userToken') as string)

        const config = {
            headers: { 'content-type': 'multipart/formdata' }
        }

        axios.post(`${process.env.SERVER_BACKEND}/user-account-manager/change-user-icon`, formData, config).then(res => {
            console.log(res.data)
            if (res.data.error == false) {
                window.location.reload()
            }
        })
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col w-full items-center">
                <h1 className="text-[#ffffff] text-xl">Change Icon</h1>
                <hr color="#656565" className="w-[85%] mt-[1rem]" />
                <div className="flex w-[85%] mt-14">
                    <label htmlFor="iconFile" className="flex border-2  border-white border-solid w-[20rem] h-[12rem]  cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            id="iconFile"
                            onChange={e => {
                                setIconFile(e.target.files)
                                previewIcon(e)
                            }}
                            accept=".jpg, .png"
                        />
                        <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="m-auto w-[7rem] h-[2rem]" />
                    </label>

                    <div className="flex flex-col  ml-auto">
                        <Icon url={ObjectUrl} />
                    </div>
                </div>
            </div>
            <hr color="#656565" className="w-[85%] mt-auto self-center" />
            <div className="flex w-[85%] self-center mt-8">
                <button className="w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-4 m-auto justify-center rounded-xl" onClick={() => changeIconSubmit()}>
                    <h1 className="self-center text-white text-lg">Change Photo</h1>
                </button>
            </div>
        </div>
    )
}

export default ChangeAccountIconComp
