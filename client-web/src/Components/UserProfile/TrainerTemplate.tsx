'use client'
import React, { useEffect, useState } from 'react'
import { IUserPrivateData, IVideoTemplate } from './IAccountProfile'
import { getCookie } from 'cookies-next'
import SelectableCards from './util/ProfileTabCards'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import AccoutSettingsPopup from './util/UserAccountSettings'
import axios from 'axios'
import VideoTamplate from './util/VideoCardTemplate'
import ChangeAccountIconComp from './util/ChangeAccountIconComp'
import AboutUserTab from './util/AboutUserTab'
import { IAccountPackages } from '../Packages/IPackages'
import PackageCardTemplate from '@/Components/Packages/PackageCardTemplate'
import useOwnerCheck from '@/hooks/useAccountOwnerCheck'
import ImgWithAuth from '../CommonUi/ImageWithAuth'

/**
 * Renders a template for a user's trainer profile.`
 * @param props - An object containing the user's data.
 * @returns A React component that displays the trainer profile template.
 */
const TrainerTemplate = (props: IUserPrivateData) => {
    const [componentToShow, setComponentToShow] = useState<string>('PackagesPage')
    const [videosData, setVideosData] = useState<Array<IVideoTemplate>>([])

    const [ToggledSettingsPopUp, setToggledSettingsPopUp] = useState<boolean>(false)
    const [ToggledIconChangePopUp, setToggledIconChangePopUp] = useState<boolean>(false)

    const [isAccIconHovered, setIsAccIconHovered] = useState<boolean>(false)

    const [userPackages, setUserPackages] = useState<Array<IAccountPackages>>([])

    const { ownerCheck, isLoading, error, isOwner } = useOwnerCheck()

    const renderComponent = () => {
        switch (componentToShow) {
            case 'PackagesPage':
                return (
                    <div className="flex w-full flex-col lg:h-[23rem] 3xl:h-[37rem]">
                        {Object.keys(userPackages).length > 0 ? (
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
                        )}
                    </div>
                )

            case 'Videos':
                return (
                    <div className="mt-4 grid h-full w-[95%] gap-4 self-center overflow-y-scroll sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {videosData.map((video: IVideoTemplate, index: number) => (
                            <VideoTamplate
                                isOwner={isOwner!}
                                key={index}
                                videotitle={video.videotitle}
                                dislikes={video.dislikes}
                                likes={video.likes}
                                ownertoken={video.ownertoken}
                                publishdate={video.publishdate}
                                packagesport={video.packagesport}
                                videotoken={video.videotoken}
                                visibility={video.visibility}
                            />
                        ))}
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

    useEffect(() => {
        ;(async () => {
            const resp = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-account-videos/${props.userpublictoken}`)
            setVideosData(resp.data.VideosData)
            if (getCookie('userToken') !== undefined) {
                ownerCheck(props.userpublictoken)
            }

            const packagesresp = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-account-packages/${props.userpublictoken}`)
            setUserPackages(packagesresp.data.packagesData)
        })()
    }, [])

    return (
        <>
            <div className="mt-[6rem] flex h-full w-full flex-col">
                {isLoading && <h1 className="self-center text-lg text-white">Loading</h1>}
                {error && <h1 className="self-center text-lg text-white">Error: {error}</h1>}
                <div className="flex h-[6rem] w-full flex-grow-0 flex-col">
                    <div className="flex h-full w-[90%] self-center">
                        <div className="flex h-32 w-80 self-center">
                            <div className="relative z-10 h-24 w-40 self-center">
                                <ImgWithAuth
                                    className="m-auto flex h-24 w-24 self-center rounded-full "
                                    onMouseLeave={() => {
                                        setIsAccIconHovered(false)
                                    }}
                                    src={`${process.env.FILE_SERVER}/${props.userpublictoken}/Main_icon.png?cache=none`}
                                    alt="Picture of the author"
                                    onMouseEnter={() => {
                                        setIsAccIconHovered(true)
                                    }}
                                />
                                {isAccIconHovered ? (
                                    <div
                                        className="absolute inset-0 m-auto flex h-24 w-24 cursor-pointer rounded-full bg-black bg-opacity-80 border "
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
                                        <h1 className="mb-1 text-white">{props.username}</h1>
                                        <img
                                            className="z-10 ml-auto h-5 w-5 cursor-pointer self-center text-white"
                                            src={`/assets/AccountIcons/Settings_icon.svg`}
                                            alt="Picture of the author"
                                            onClick={() => {
                                                setToggledSettingsPopUp(!ToggledSettingsPopUp)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <h1 className="mb-1 text-white">{props.username}</h1>
                                )}
                                <hr className="h-[0.1rem] w-full self-center bg-white" />
                                <h1 className="mt-1 text-white">{props.sport} coach</h1>
                            </div>
                        </div>
                        <div className="ml-auto flex h-32 w-72 flex-col self-center rounded-xl bg-[#0000005e]">
                            <div className="mt-4 flex w-full">
                                <h1 className="ml-4 self-center text-white">Account Rating</h1>
                                {props.rating == null ? (
                                    <>
                                        <h1 className="ml-auto mr-2 self-center text-white">0/5</h1>
                                        <img className="z-10 mr-4 h-10 w-10 self-center text-white" src={`/assets/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="ml-auto mr-2 self-center text-white">{props.rating}/5</h1>
                                        <img className="z-10 mr-4 h-10 w-10 self-center text-white" src={`/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                                    </>
                                )}
                            </div>
                            <div className="mt-4 flex w-full self-center">
                                <h1 className="ml-4 self-center text-white">Account Folowers</h1>
                                <h1 className="ml-auto mr-16 text-white">{props.accountfolowers}</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 flex flex-grow-0 items-center">
                    <SelectableCards
                        Title="PACKAGES"
                        TabName="PackagesPage"
                        setComponentToShow={setComponentToShow}
                        className="ml-2 h-[3rem] w-[10rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                        activeTab={componentToShow}
                    />
                    <SelectableCards
                        Title="POSTS"
                        TabName="Posts"
                        setComponentToShow={setComponentToShow}
                        className="ml-2 h-[3rem] w-[10rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                        activeTab={componentToShow}
                    />
                    <SelectableCards
                        Title="VIDEOS"
                        TabName="Videos"
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
        </>
    )
}

export default TrainerTemplate
