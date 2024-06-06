import React, { useEffect, useState } from 'react'
import { IUserPrivateData } from './IAccountProfile'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import AccoutSettingsPopup from './util/UserAccountSettings'
import ChangeAccountIconComp from './util/ChangeAccountIconComp'

/**
 * Renders a template for a user's athlete profile.
 * @param props - An object containing the user's data.
 * @returns A React component that displays the trainer profile template.
 */
const SportsPersonTemplate = (props: IUserPrivateData) => {
    const [ToggledSettingsPopUp, setToggledSettingsPopUp] = useState(false)
    const [ToggledIconChangePopUp, setToggledIconChangePopUp] = useState(false)

    const [isAccIconHovered, setIsAccIconHovered] = useState(false)

    useEffect(() => {
        /**
         * Get user profile Data
         */
        ;(async () => {})()
    }, [])

    return (
        <div className="flex flex-col w-full  ">
            <div className="flex flex-col  w-full h-64">
                <div className="flex relative flex-col self-center mt-6 w-32 h-32">
                    <img
                        onMouseEnter={() => {
                            setIsAccIconHovered(true)
                        }}
                        onMouseLeave={() => {
                            setIsAccIconHovered(false)
                        }}
                        className="rounded-full m-auto w-32 h-32"
                        src={`${process.env.FILE_SERVER}/${props.userpublictoken}/Main_icon.png?cache=none`}
                        alt="Picture of the author"
                    />
                    {isAccIconHovered ? (
                        <div
                            className="flex absolute inset-0 rounded-full w-32 h-32 m-auto bg-black bg-opacity-80 cursor-pointer"
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

                <div className="flex flex-col w-[15vw]  h-[7vh] self-center justify-center items-center ">
                    <div className="flex w-full justify-center">
                        <h1 className="text-white self-center text-xl">{props.username}</h1>
                        <img
                            className="self-center ml-4 mt-1 cursor-pointer"
                            src="/assets/AccountIcons/Settings_icon.svg"
                            width={20}
                            height={20}
                            alt="Setting icon"
                            onClick={() => {
                                setToggledSettingsPopUp(!ToggledSettingsPopUp)
                            }}
                        />
                    </div>
                    <div className="flex w-full justify-center"></div>
                </div>
            </div>

            {ToggledSettingsPopUp ? (
                <PopupCanvas
                    closePopup={() => {
                        setToggledSettingsPopUp(!ToggledSettingsPopUp)
                    }}
                >
                    <AccoutSettingsPopup
                        Sport={props.sport}
                        AccountType={props.accounttype}
                        UserName={props.username}
                        UserEmail={props.useremail}
                        UserVisibility="public"
                        UserDescription={props.description}
                    />
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

            <hr className="w-full bg-white h-[0.1rem] " />
        </div>
    )
}

export default SportsPersonTemplate
