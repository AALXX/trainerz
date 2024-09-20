'use client'
import PackageCardTemplate from '@/Components/Packages/PackageCardTemplate'
import useOwnerCheck from '@/hooks/useAccountOwnerCheck'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import { useEffect, useState } from 'react'
import DoubleValueOptionPicker from '../CommonUi/DoubleValueOptionPicker'
import ImgWithAuth from '../CommonUi/ImageWithAuth'
import OptionPicker from '../CommonUi/OptionPicker'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import { IAccountPackages } from '../Packages/IPackages'
import { IUserPrivateData, IVideoTemplate } from './IAccountProfile'
import AboutUserTab from './util/AboutUserTab'
import ChangeAccountIconComp from './util/ChangeAccountIconComp'
import SelectableCards from './util/ProfileTabCards'
import AccoutSettingsPopup from './util/UserAccountSettings'
import VideoTemplate from './util/VideoCardTemplate'

const TrainerTemplate = (props: IUserPrivateData) => {
    const [componentToShow, setComponentToShow] = useState<string>('PackagesPage')
    const [videosData, setVideosData] = useState<Array<IVideoTemplate>>([])
    const [filteredVideos, setFilteredVideos] = useState<Array<IVideoTemplate>>([])

    const [ToggledSettingsPopUp, setToggledSettingsPopUp] = useState<boolean>(false)
    const [ToggledIconChangePopUp, setToggledIconChangePopUp] = useState<boolean>(false)

    const [isAccIconHovered, setIsAccIconHovered] = useState<boolean>(false)

    const [userPackages, setUserPackages] = useState<Array<IAccountPackages>>([])
    const [filteredPackages, setFilteredPackages] = useState<Array<IAccountPackages>>([])

    const [sport, setSport] = useState<string>('')
    const [packageToken, setPackageToken] = useState<string>('')

    const { ownerCheck, isLoading, error, isOwner } = useOwnerCheck()
    const [showFilter, setShowFilter] = useState(false)

    const filterVideos = () => {
        let filtered = videosData
        if (sport) {
            filtered = filtered.filter(video => video.packagesport === sport)
        }

        if (packageToken) {
            filtered = filtered.filter(video => video.packagetoken === packageToken)
        }

        setFilteredVideos(filtered)
    }

    const filterPackages = () => {
        let filtered = userPackages
        if (sport) {
            filtered = filtered.filter(pckg => pckg.packagesport === sport)
        }

        if (packageToken) {
            filtered = filtered.filter(video => video.packagetoken === packageToken)
        }
        setFilteredPackages(filtered)
    }

    useEffect(() => {
        ;(async () => {
            const resp = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-account-videos/${props.userpublictoken}`)

            setVideosData(resp.data.VideosData)
            setFilteredVideos(resp.data.VideosData)
            if (getCookie('userToken') !== undefined) {
                ownerCheck(props.userpublictoken)
            }

            const packagesresp = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-account-packages/${props.userpublictoken}`)
            setUserPackages(packagesresp.data.packagesData)
            setFilteredPackages(packagesresp.data.packagesData)
        })()
    }, [])

    const renderComponent = () => {
        switch (componentToShow) {
            case 'PackagesPage':
                return (
                    <div className="flex w-full flex-col lg:h-[23rem] 3xl:h-[37rem]">
                        {Object.keys(userPackages).length > 0 ? (
                            <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredPackages
                                    .sort((a, b) => new Date(b.rating).getTime() - new Date(a.rating).getTime())
                                    .map((packageData: IAccountPackages, index: number) => (
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
                        <button
                            onClick={() => {
                                setShowFilter(!showFilter)
                            }}
                            className="fixed bottom-4 right-4 z-20 rounded-full bg-[#00000080] p-2"
                        >
                            <img src="/assets/Fiter_Icon.svg" alt="Filter Icon" className="h-8 w-8" />
                        </button>
                        {showFilter && (
                            <div className="fixed right-0 top-0 z-30 flex h-full w-64 translate-x-0 transform flex-col bg-[#00000080] transition-transform duration-300 ease-in-out">
                                <h2 className="p-4 text-white">Filters</h2>
                                <button
                                    className="absolute right-2 top-2 text-white hover:text-gray-300 focus:outline-none"
                                    onClick={() => {
                                        setShowFilter(!showFilter)
                                    }}
                                    aria-label="Close"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                                <hr />
                                <div className="mt-8 flex w-[90%] flex-col self-center">
                                    <h1 className="text-white">Filter By Sport</h1>
                                    <OptionPicker
                                        label="Sport"
                                        options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field)', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                                        value={sport}
                                        onChange={value => {
                                            setSport(value)
                                        }}
                                    />
                                </div>
                                <div className="mt-2 flex w-[90%] flex-col self-center">
                                    <h1 className="text-white">Filter By Package</h1>
                                    <DoubleValueOptionPicker
                                        label="Video Package"
                                        options={userPackages.map(pkg => ({ label: pkg.packagename, value: pkg.packagetoken }))}
                                        value={packageToken}
                                        onChange={value => {
                                            setPackageToken(value)
                                        }}
                                    />
                                </div>
                                <button onClick={filterPackages} className="mb-4 mt-auto h-10 w-[90%] self-center rounded-2xl border text-xl text-white">
                                    Filter
                                </button>
                            </div>
                        )}
                    </div>
                )

            case 'Videos':
                return (
                    <div className="flex w-full flex-col lg:h-[23rem] 3xl:h-[37rem]">
                        <div className="flex w-full">
                            {Object.keys(userPackages).length > 0 ? (
                                <div className="relative w-full">
                                    <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                        {filteredVideos
                                            .sort((a, b) => new Date(b.publishdate).getTime() - new Date(a.publishdate).getTime())
                                            .map((video: IVideoTemplate, index: number) => (
                                                <VideoTemplate
                                                    isOwner={isOwner!}
                                                    key={index}
                                                    videotitle={video.videotitle}
                                                    dislikes={video.dislikes}
                                                    likes={video.likes}
                                                    ownertoken={video.ownertoken}
                                                    publishdate={video.publishdate}
                                                    packagesport={video.packagesport}
                                                    packagetoken={video.packagetoken}
                                                    videotoken={video.videotoken}
                                                    visibility={video.visibility}
                                                    status={video.status}
                                                />
                                            ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowFilter(!showFilter)
                                        }}
                                        className="fixed bottom-4 right-4 z-20 rounded-full bg-[#00000080] p-2"
                                    >
                                        <img src="/assets/Fiter_Icon.svg" alt="Filter Icon" className="h-8 w-8" />
                                    </button>
                                    {showFilter && (
                                        <div className="fixed right-0 top-0 z-30 flex h-full w-64 translate-x-0 transform flex-col bg-[#00000080] transition-transform duration-300 ease-in-out">
                                            <h2 className="p-4 text-white">Filters</h2>
                                            <button
                                                className="absolute right-2 top-2 text-white hover:text-gray-300 focus:outline-none"
                                                onClick={() => {
                                                    setShowFilter(!showFilter)
                                                }}
                                                aria-label="Close"
                                            >
                                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                            </button>
                                            <hr />
                                            <div className="mt-8 flex w-[90%] flex-col self-center">
                                                <h1 className="text-white">Filter By Sport</h1>
                                                <OptionPicker
                                                    label="Sport"
                                                    options={[
                                                        'Football',
                                                        'Basketball',
                                                        'Cricket',
                                                        'Tennis',
                                                        'Golf',
                                                        'Rugby',
                                                        'Ice Hockey',
                                                        'Athletics (Track and Field)',
                                                        'Swimming',
                                                        'Powerlifting',
                                                        'Bodybuilding',
                                                        'Other'
                                                    ]}
                                                    value={sport}
                                                    onChange={value => {
                                                        setSport(value)
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-2 flex w-[90%] flex-col self-center">
                                                <h1 className="text-white">Filter By Package</h1>
                                                <DoubleValueOptionPicker
                                                    label="Video Package"
                                                    options={userPackages.map(pkg => ({ label: pkg.packagename, value: pkg.packagetoken }))}
                                                    value={packageToken}
                                                    onChange={value => {
                                                        setPackageToken(value)
                                                    }}
                                                />
                                            </div>
                                            <button onClick={filterVideos} className="mb-4 mt-auto h-10 w-[90%] self-center rounded-2xl border text-xl text-white">
                                                Filter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <h1 className="mt-4 self-center text-white">No Packages!</h1>
                            )}
                        </div>
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
        <>
            <div className="mt-[6rem] flex h-full w-full flex-col">
                {isLoading && <h1 className="self-center text-lg text-white">Loading</h1>}
                {error && <h1 className="self-center text-lg text-white">Error: {error}</h1>}
                <div className="flex h-[6rem] w-full flex-grow-0 flex-col">
                    <div className="flex h-full w-[90%] flex-col self-center sm:flex-row lg:flex-row">
                        <div className="flex h-32 w-80 flex-col self-center md:flex-row">
                            <div className="relative z-10 h-24 w-40 self-center">
                                <ImgWithAuth
                                    className="m-auto flex h-24 w-24 self-center rounded-full"
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
                                        className="absolute inset-0 m-auto flex h-24 w-24 cursor-pointer rounded-full border bg-black bg-opacity-80"
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
                        <div className="mt-12 flex h-32 w-72 flex-col self-center rounded-xl bg-[#0000005e] sm:ml-auto">
                            <div className="m-auto flex w-full flex-col">
                                <h1 className="ml-4 self-center text-lg text-white">Account Rating</h1>
                                {props.rating == null ? (
                                    <div className="ml-8 flex h-10 self-center">
                                        <h1 className="self-center text-lg text-white">0/5</h1>
                                        <img className="w-10 self-center text-white" src={`/assets/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                                    </div>
                                ) : (
                                    <div className="ml-8 flex h-10 self-center">
                                        <h1 className="self-center text-lg text-white">{props.rating}/5</h1>
                                        <img className="w-10 self-center text-white" src={`/assets/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-40 flex flex-grow-0 items-center sm:mt-14">
                    <SelectableCards
                        Title="PACKAGES"
                        TabName="PackagesPage"
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
