'use client'
import React, { useEffect, useState } from 'react'
import { IUserPrivateData, IVideoTemplate } from './IAccountProfile'
import { getCookie } from 'cookies-next'
import SelectableCards from './util/ProfileTabCards'
import { ownerCheck } from '@/Auth-Security/Security'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import AccoutSettingsPopup from './util/UserAccountSettings'
import axios from 'axios'
import VideoTamplate from './util/VideoCardTemplate'
import ChangeAccountIconComp from './util/ChangeAccountIconComp'
import AboutUserTab from './util/AboutUserTab'
import Link from 'next/link'

/**
 * Renders a template for a user's trainer profile.
 * @param props - An object containing the user's data.
 * @returns A React component that displays the trainer profile template.
 */
const TrainerTemplate = (props: IUserPrivateData) => {
    const [componentToShow, setComponentToShow] = useState<string>('PackagesPage')
    const [isOwner, setIsOwner] = useState<boolean>(false)
    const [videosData, setVideosData] = useState<Array<IVideoTemplate>>([])

    const [ToggledSettingsPopUp, setToggledSettingsPopUp] = useState<boolean>(false)
    const [ToggledIconChangePopUp, setToggledIconChangePopUp] = useState<boolean>(false)

    const [isAccIconHovered, setIsAccIconHovered] = useState<boolean>(false)

    const renderComponent = () => {
        switch (componentToShow) {
            case 'PackagesPage':
                return (
                    <>
                        <div className="grid xl:grid-cols-6 lg:grid-cols-5 gap-4 "> No Packages</div>
                        <Link href="/account/package-creator">Create Package</Link>
                    </>
                )

            case 'Videos':
                return (
                    <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {videosData.map((video: IVideoTemplate, index: number) => (
                            <VideoTamplate
                                isOwner={isOwner}
                                key={index}
                                videotitle={video.videotitle}
                                dislikes={video.dislikes}
                                likes={video.likes}
                                ownertoken={video.ownertoken}
                                publishdate={video.publishdate}
                                sportname={video.sportname}
                                videoprice={video.videoprice}
                                videotoken={video.videotoken}
                                visibility={video.visibility}
                            />
                        ))}
                    </div>
                )

            case 'About':
                return (
                    <div className="w-full h-[60%]">
                        <AboutUserTab userDescription={props.description} userEmail={props.useremail} userPhone={props.phonenumber} />
                    </div>
                )

            default:
                return <div>No matching component found</div>
        }
    }

    useEffect(() => {
        ;(async () => {
            const resp = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-account-videos/${props.userpublictoken}`)
            setVideosData(resp.data.VideosData)
            if (getCookie('userToken') !== undefined) {
                setIsOwner(await ownerCheck(props.userpublictoken))
            }
        })()
    }, [])

    return (
        <div className="flex flex-col w-full h-full ">
            <div className="flex flex-col  w-full h-44">
                <div className="flex h-full w-[90%] self-center ">
                    <div className="flex w-80 self-center h-32 ">
                        <div className="z-10 relative self-center w-40 h-24 ">
                            <img
                                className="flex rounded-full w-full h-full self-center m-auto"
                                onMouseEnter={() => {
                                    setIsAccIconHovered(true)
                                }}
                                onMouseLeave={() => {
                                    setIsAccIconHovered(false)
                                }}
                                src={`${process.env.FILE_SERVER}/${props.userpublictoken}/Main_icon.png?cache=none`}
                                alt="Picture of the author"
                            />
                            {isAccIconHovered ? (
                                <div
                                    className="flex absolute inset-0 rounded-full  w-full h-full m-auto bg-black bg-opacity-80 cursor-pointer"
                                    onMouseEnter={() => {
                                        setIsAccIconHovered(true)
                                    }}
                                    onMouseLeave={() => {
                                        setIsAccIconHovered(false)
                                    }}
                                    onClick={() => {
                                        setToggledIconChangePopUp(!ToggledIconChangePopUp)
                                    }}
                                >
                                    <img className="w-[90%] h-[90%] m-auto rounded-full" src="/assets/AccountIcons/EditProfileIcon_Icon.svg" alt="Overlay image" />
                                </div>
                            ) : null}
                        </div>
                        <div className="self-center w-full ml-2">
                            {isOwner ? (
                                <div className="flex ">
                                    <h1 className="text-white mb-1">{props.username}</h1>
                                    <img
                                        className="z-10  w-5 h-5 self-center ml-auto text-white cursor-pointer"
                                        src={`/assets/AccountIcons/Settings_icon.svg`}
                                        alt="Picture of the author"
                                        onClick={() => {
                                            setToggledSettingsPopUp(!ToggledSettingsPopUp)
                                        }}
                                    />
                                </div>
                            ) : (
                                <h1 className="text-white mb-1">{props.username}</h1>
                            )}
                            <hr className="self-center w-full bg-white h-[0.1rem] " />
                            <h1 className="text-white mt-1">{props.sport} coach</h1>
                        </div>
                    </div>
                    <div className="flex flex-col ml-auto bg-[#0000005e] h-32 w-72 self-center rounded-xl">
                        <div className="flex w-full mt-4 ">
                            <h1 className="self-center  ml-4 text-white">Account Rating</h1>
                            {props.rating == null ? (
                                <>
                                    <h1 className="self-center ml-auto mr-2 text-white">0/5</h1>
                                    <img className="z-10  w-10 h-10 self-center mr-4 text-white" src={`/assets/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                                </>
                            ) : (
                                <>
                                    <h1 className="self-center ml-auto mr-2 text-white">{props.rating}/5</h1>
                                    <img className="z-10  w-10 h-10 self-center mr-4 text-white" src={`/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                                </>
                            )}
                        </div>
                        <div className="flex w-full self-center mt-4">
                            <h1 className="self-center  ml-4 text-white">Account Folowers</h1>
                            <h1 className="text-white ml-auto mr-16">{props.accountfolowers}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex mt-10 items-center ">
                <SelectableCards Title="PACKAGES" TabName="PackagesPage" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[10rem] h-[3rem] justify-center ml-2 cursor-pointer rounded-t-xl" />
                <SelectableCards Title="POSTS" TabName="Videos" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[10rem] h-[3rem] justify-center ml-2 cursor-pointer rounded-t-xl" />
                <SelectableCards Title="VIDEOS" TabName="Videos" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[10rem] h-[3rem] justify-center ml-2 cursor-pointer rounded-t-xl" />
                <SelectableCards Title="ABOUT ME" TabName="About" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[10rem] h-[3rem] justify-center ml-2 cursor-pointer rounded-t-xl" />
            </div>
            <hr className="w-full bg-white h-[0.1rem] " />
            {ToggledSettingsPopUp ? (
                <PopupCanvas
                    closePopup={() => {
                        setToggledSettingsPopUp(!ToggledSettingsPopUp)
                    }}
                >
                    <AccoutSettingsPopup Sport={props.sport} AccountType={props.accounttype} UserName={props.username} UserEmail={props.useremail} UserVisibility="public" UserDescription={props.description} />
                </PopupCanvas>
            ) : null}
            {ToggledIconChangePopUp ? (
                <PopupCanvas
                    closePopup={() => {
                        setToggledIconChangePopUp(!ToggledIconChangePopUp)
                    }}
                >
                    <ChangeAccountIconComp />
                </PopupCanvas>
            ) : null}
            {renderComponent()}
        </div>
    )
}

export default TrainerTemplate
