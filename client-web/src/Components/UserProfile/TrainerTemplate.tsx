'use client'
import React, { useEffect, useState } from 'react'
import { IUserData } from './IAccountProfile'
import { getCookie } from 'cookies-next'
import ProfileCards from './util/ProfileTabCards'
import { ownerCheck } from '@/Auth-Security/Security'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import AccoutSettingsPopup from './util/UserAccountSettings'

/**
 * Renders a template for a user's trainer profile.
 * @param props - An object containing the user's data.
 * @returns A React component that displays the trainer profile template.
 */
const TrainerTemplate = (props: IUserData) => {
    const [componentToShow, setComponentToShow] = useState<string>('LandingPage')
    const [isOwner, setIsOwner] = useState<boolean>(false)

    const [ToggledSettingsPopUp, setToggledSettingsPopUp] = useState(false)
    const [ToggledIconChangePopUp, setToggledIconChangePopUp] = useState(false)

    const [isAccIconHovered, setIsAccIconHovered] = useState(false)

    const renderComponent = () => {
        switch (componentToShow) {
            case 'LandingPage':
                return <div className="grid xl:grid-cols-6 lg:grid-cols-5 gap-4 "></div>
            case 'Videos':
                return (
                    <div>
                        {/* <div className="grid xl:grid-cols-6 lg:grid-cols-5 gap-4 ">
                            {videosData.map((video: IVideoTemplateProps, index: number) => (
                                <VideoTamplate key={index} VideoTitle={video.VideoTitle} VideoToken={video.VideoToken} Likes={video.Likes} Dislikes={video.Dislikes} />
                            ))}
                        </div> */}
                    </div>
                )

            case 'About':
                return <h1>test</h1>
            // return <AboutChanelTab userDescription={userData.UserDescription} />

            default:
                return <div>No matching component found</div>
        }
    }

    useEffect(() => {
        ;(async () => {
            setIsOwner(await ownerCheck())
        })()
    }, [])

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col  w-full h-44">
                <div className="flex h-full w-[90%] self-center ">
                    <div className="flex w-60 self-center h-32 ">
                        <img className="z-10 rounded-full w-24 h-24 self-center " src={`${process.env.FILE_SERVER}/${getCookie('userPublicToken')}/Main_icon.png`} alt="Picture of the author" />
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
                            <h1 className="text-white mt-1">{props.accountfolowers} Folowers</h1>
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
                            <h1 className="self-center  ml-4 text-white">Account Views</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex mt-10 items-center ">
                <ProfileCards Title="LANDING PAGE" TabName="LandingPage" setComponentToShow={setComponentToShow} />
                <ProfileCards Title="POSTS" TabName="Videos" setComponentToShow={setComponentToShow} />
                <ProfileCards Title="VIDEOS" TabName="Videos" setComponentToShow={setComponentToShow} />
                <ProfileCards Title="ABOUT ME" TabName="About" setComponentToShow={setComponentToShow} />
            </div>
            <hr className="w-sfull bg-white h-[0.1rem] " />
            {ToggledSettingsPopUp ? (
                <PopupCanvas
                    closePopup={() => {
                        setToggledSettingsPopUp(!ToggledSettingsPopUp)
                    }}
                >
                    <AccoutSettingsPopup
                        AccountPrice={props.accountprice}
                        Sport={props.sport}
                        AccountType={props.accounttype}
                        UserName={props.username}
                        UserEmail={props.useremail}
                        UserVisibility="public"
                        UserDescription={props.description}
                    />
                </PopupCanvas>
            ) : null}
            <div className="w-full flex">{renderComponent()}</div>
        </div>
    )
}

export default TrainerTemplate
