import React, { useEffect, useState } from 'react'
import { IUserPrivateData } from './IAccountProfile'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import AccoutSettingsPopup from './util/UserAccountSettings'
import ChangeAccountIconComp from './util/ChangeAccountIconComp'
import AboutUserTab from './util/AboutUserTab'
import SelectableCards from './util/ProfileTabCards'
import useOwnerCheck from '@/hooks/useAccountOwnerCheck'
import { getCookie } from 'cookies-next'
import ImgWithAuth from '../CommonUi/ImageWithAuth'

/**
 * Renders a template for a user's athlete profile.
 * @param props - An object containing the user's data.
 * @returns A React component that displays the trainer profile template.
 */
const SportsPersonTemplate = (props: IUserPrivateData) => {
    const [ToggledSettingsPopUp, setToggledSettingsPopUp] = useState(false)
    const [ToggledIconChangePopUp, setToggledIconChangePopUp] = useState(false)

    const [isAccIconHovered, setIsAccIconHovered] = useState(false)
    const [componentToShow, setComponentToShow] = useState<string>('Photos')
    const { ownerCheck, isLoading, error, isOwner } = useOwnerCheck()

    useEffect(() => {
        ;(async () => {
            if (getCookie('userToken') !== undefined) {
                ownerCheck(props.userpublictoken)
            }
        })()
    }, [])

    const renderComponent = () => {
        switch (componentToShow) {
            case 'Photos':
                return (
                    <div className="flex w-full flex-col lg:h-[23rem] 3xl:h-[37rem]">
                        {/* {Object.keys(userPackages).length > 0 ? (
                            <div className="mt-4 grid h-full w-[95%] gap-4 self-center overflow-y-scroll sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {userPackages.map((packageData: IAccountPackages, index: number) => (
                                    <PackageCardTemplate
                                        packagesport={packageData.packagesport}
                                        packagetoken={packageData.packagetoken}
                                        key={index}
                                        rating={packageData.rating}
                                        packagename={packageData.packagename}
                                        isOwner={isOwner!}
                                        ownertoken={packageData.ownertoken}
                                    />
                                ))}
                            </div>
                        ) : (
                            <h1 className="mt-4 self-center text-white">No Packages!</h1>
                        )} */}
                    </div>
                )

            case 'About':
                return (
                    <div className="h-[60%] w-full">
                        <AboutUserTab userDescription={props.description} userEmail={props.useremail} userPhone={props.phonenumber} />
                    </div>
                )

            default:
                return <div>No matching component found</div>
        }
    }
    return (
        <div className="mt-[4rem] flex h-full w-full flex-col">
            <div className="flex h-[10rem] w-full flex-grow-0 flex-col">
                <div className="flex h-48 w-48 flex-col self-center">
                    <div className="relative z-10 h-28 w-40 self-center">
                        <ImgWithAuth
                            className="m-auto flex h-28 w-28 self-center rounded-full"
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
                                className="absolute inset-0 m-auto flex h-28 w-28 cursor-pointer rounded-full bg-black bg-opacity-80"
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
                    <div className="ml-2 w-full self-center">
                        {isOwner ? (
                            <div className="flex">
                                <h1 className="text-white">{props.username}</h1>
                                <img
                                    className="z-10 ml-2 h-5 w-5 cursor-pointer self-center text-white"
                                    src={`/assets/AccountIcons/Settings_icon.svg`}
                                    alt="Picture of the author"
                                    onClick={() => {
                                        setToggledSettingsPopUp(!ToggledSettingsPopUp)
                                    }}
                                />
                            </div>
                        ) : (
                            <h1 className="mt-2 text-white">{props.username}</h1>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-8 flex flex-grow-0 items-center">
                <SelectableCards
                    Title="PHOTOS"
                    TabName="Photos"
                    setComponentToShow={setComponentToShow}
                    className="ml-2 h-[3rem] w-[10rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                    activeTab={componentToShow}
                />
                <SelectableCards
                    Title="ABOUT ME"
                    TabName="About"
                    setComponentToShow={setComponentToShow}
                    className="ml-2 h-[3rem] w-[10rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                    activeTab={componentToShow}
                />
            </div>
            <hr className="h-[0.1rem] w-full bg-white" />

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

export default SportsPersonTemplate
