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
        <div className="flex w-full flex-col">
            <div className="flex h-64 w-full flex-col">
                <div className="relative mt-6 flex h-32 w-32 flex-col self-center">
                    <img
                        onMouseEnter={() => {
                            setIsAccIconHovered(true)
                        }}
                        onMouseLeave={() => {
                            setIsAccIconHovered(false)
                        }}
                        className="m-auto h-32 w-32 rounded-full"
                        src={`${process.env.FILE_SERVER}/${props.userpublictoken}/Main_icon.png?cache=none`}
                        alt="Picture of the author"
                    />
                    {isAccIconHovered ? (
                        <div
                            className="absolute inset-0 m-auto flex h-32 w-32 cursor-pointer rounded-full bg-black bg-opacity-80"
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
                            <img className="m-auto h-[90%] w-[90%] rounded-full" src="/assets/AccountIcons/EditProfileIcon_Icon.svg" alt="Overlay image" />
                        </div>
                    ) : null}
                </div>

                <div className="flex h-[7vh] w-[15vw] flex-col items-center justify-center self-center">
                    <div className="flex w-full justify-center">
                        <h1 className="self-center text-xl text-white">{props.username}</h1>
                        <img
                            className="ml-4 mt-1 cursor-pointer self-center"
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

            <hr className="h-[0.1rem] w-full bg-white" />
        </div>
    )
}

export default SportsPersonTemplate
