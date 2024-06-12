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
            <div className="m-auto flex h-[10rem] w-[10rem] flex-col rounded-full border-2 border-white">
                <h1 className="m-auto text-sm text-white">No image Inputed</h1>
            </div>
        )
    }

    return <img src={url} alt="" className="m-auto h-[10rem] w-[10rem] rounded-full" />
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
        <div className="flex h-full w-full flex-col">
            <div className="flex w-full flex-col items-center">
                <h1 className="text-xl text-[#ffffff]">Change Icon</h1>
                <hr color="#656565" className="mt-[1rem] w-[85%]" />
                <div className="mt-14 flex w-[85%]">
                    <label htmlFor="iconFile" className="flex h-[12rem] w-[20rem] cursor-pointer border-2 border-solid border-white">
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
                        <img src="/assets/UploadPageIcons/VideoUploadIcon.svg" alt="AccountImageButton" className="m-auto h-[2rem] w-[7rem]" />
                    </label>

                    <div className="ml-auto flex flex-col">
                        <Icon url={ObjectUrl} />
                    </div>
                </div>
            </div>
            <hr color="#656565" className="mt-auto w-[85%] self-center" />
            <div className="mt-8 flex w-[85%] self-center">
                <button className="m-auto mb-4 h-12 w-[85%] justify-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={() => changeIconSubmit()}>
                    <h1 className="self-center text-lg text-white">Change Photo</h1>
                </button>
            </div>
        </div>
    )
}

export default ChangeAccountIconComp
