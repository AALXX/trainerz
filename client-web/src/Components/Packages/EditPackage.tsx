'use client'
import React, { useEffect, useState } from 'react'
import { IEditPackages } from './IPackages'
import AddPhotoZone from './util/addPhotoZone'
import { useRouter } from 'next/navigation'
import { getCookie } from 'cookies-next'
import OptionPicker from '../CommonUi/OptionPicker'
import SelectableCards from '../UserProfile/util/ProfileTabCards'
import axios from 'axios'
import EditTierTemplate from './EditTierTemplate'

const EditPackage = (props: IEditPackages) => {
    const [componentToShow, setComponentToShow] = useState<string>('Basic')

    const router = useRouter()

    //* -------------Basic Package------------
    const [basicPrice, setBasicPrice] = useState<number>(0)
    const [basicRecurring, setBasicRecurring] = useState<boolean>(false)
    const [basicAccesVideos, setBasicAccesVideos] = useState<boolean>(false)
    const [basicCoaching, setBasicCoaching] = useState<boolean>(false)
    const [basicCustomProgram, setBasicCustomProgram] = useState<boolean>(false)
    const [basicDescription, setBasicDescription] = useState<string>('')

    //* -------------Standard Package------------
    const [standardPrice, setStandardPrice] = useState<number>(0)
    const [standardRecurring, setStandardRecurring] = useState<boolean>(false)
    const [standardAccesVideos, setStandardAccesVideos] = useState<boolean>(false)
    const [standardCoaching, setStandardCoaching] = useState<boolean>(false)
    const [standardCustomProgram, setStandardCustomProgram] = useState<boolean>(false)
    const [standardDescription, setStandardDescription] = useState<string>('')

    //* -------------Premium Package------------
    const [premiumPrice, setPremoiumPrice] = useState<number>(0)
    const [premiumRecurring, setPremiumRecurring] = useState<boolean>(false)
    const [premiumAccesVideos, setPremiumAccesVideos] = useState<boolean>(false)
    const [premiumCoaching, setPremiumCoaching] = useState<boolean>(false)
    const [premiumCustomProgram, setPremiumCustomProgram] = useState<boolean>(false)
    const [premiumDescription, setPremiumDescription] = useState<string>('')

    const [packageName, setPackageName] = useState<string>('')

    const [image1, setImage1] = useState<File | null>(null)
    const [image2, setImage2] = useState<File | null>(null)
    const [image3, setImage3] = useState<File | null>(null)
    const [image4, setImage4] = useState<File | null>(null)

    const [sport, setSport] = useState<string>('')
    const [ownerToken, setOwnerToken] = useState<string>('')

    const renderComponent = () => {
        switch (componentToShow) {
            case 'Basic':
                return (
                    <>
                        <EditTierTemplate
                            acces_videos={basicAccesVideos}
                            setAccesVideos={setBasicAccesVideos}
                            coaching_101={basicCoaching}
                            setCoaching101={setBasicCoaching}
                            custom_program={basicCustomProgram}
                            setCustomProgram={setBasicCustomProgram}
                            description={basicDescription}
                            setDescription={setBasicDescription}
                            recurring={basicRecurring}
                            setRecurring={setBasicRecurring}
                            price={basicPrice}
                        />
                    </>
                )

            case 'Standard':
                return (
                    <>
                        <EditTierTemplate
                            acces_videos={standardAccesVideos}
                            setAccesVideos={setStandardAccesVideos}
                            coaching_101={standardCoaching}
                            setCoaching101={setStandardCoaching}
                            custom_program={standardCustomProgram}
                            setCustomProgram={setStandardCustomProgram}
                            description={standardDescription}
                            setDescription={setStandardDescription}
                            recurring={standardRecurring}
                            setRecurring={setStandardRecurring}
                            price={standardPrice}
                        />
                    </>
                )

            case 'Premium':
                return (
                    <>
                        <EditTierTemplate
                            acces_videos={premiumAccesVideos}
                            setAccesVideos={setPremiumAccesVideos}
                            coaching_101={premiumCoaching}
                            setCoaching101={setPremiumCoaching}
                            custom_program={premiumCustomProgram}
                            setCustomProgram={setPremiumCustomProgram}
                            description={premiumDescription}
                            setDescription={setPremiumDescription}
                            recurring={premiumRecurring}
                            setRecurring={setPremiumRecurring}
                            price={premiumPrice}
                        />
                    </>
                )

            default:
                return <div>No matching component found</div>
        }
    }

    useEffect(() => {
        ;(async () => {
            const { data } = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-package-data/${props.packageToken}`)
            const photoUrls = Array.from({ length: data.photosNumber }, (_, i) => `${process.env.FILE_SERVER}/${data.ownerToken}/Package_${props.packageToken}/Photo_${i + 1}.jpg?cache=none`)
            // if (photoUrls.length > 0) setImage1(await urlToFile(photoUrls[0], `Photo_1.jpg`, 'image/jpeg'))
            // if (photoUrls.length > 1) setImage2(await urlToFile(photoUrls[1], `Photo_2.jpg`, 'image/jpeg'))
            // if (photoUrls.length > 2) setImage3(await urlToFile(photoUrls[2], `Photo_3.jpg`, 'image/jpeg'))
            // if (photoUrls.length > 3) setImage4(await urlToFile(photoUrls[3], `Photo_4.jpg`, 'image/jpeg'))

            setImage1(`${process.env.FILE_SERVER}/${ownerToken}/Package_${props.packageToken}/Photo_${1}.jpg?cache=none` as unknown as File)

            setBasicPrice(data.basicTier.price)
            setStandardPrice(data.standardTier.price)
            setPremoiumPrice(data.premiumTier.price)

            setBasicRecurring(data.basicTier.recurring)
            setStandardRecurring(data.standardTier.recurring)
            setPremiumRecurring(data.premiumTier.recurring)

            setBasicAccesVideos(data.basicTier.acces_videos)
            setStandardAccesVideos(data.standardTier.acces_videos)
            setPremiumAccesVideos(data.premiumTier.acces_videos)

            setBasicCoaching(data.basicTier.coaching_101)
            setStandardCoaching(data.standardTier.coaching_101)
            setPremiumCoaching(data.premiumTier.coaching_101)

            setBasicCustomProgram(data.basicTier.custom_program)
            setStandardCustomProgram(data.standardTier.custom_program)
            setPremiumCustomProgram(data.premiumTier.custom_program)

            setBasicDescription(data.basicTier.description)
            setStandardDescription(data.standardTier.description)
            setPremiumDescription(data.premiumTier.description)

            // setPhotos(newPhotos)

            setOwnerToken(data.ownerToken)
            setPackageName(data.packageName)
            setSport(data.sport)
        })()
    }, [ownerToken])

    const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
        console.log(url)
        const res = await axios.get(url)
        const blob = await res.data.blob()
        return new File([blob], filename, { type: mimeType })
    }

    const updatePackage = async () => {
        const resp = await axios.post(`${process.env.SERVER_BACKEND}/package-manager/update-package`, {
            packageToken: props.packageToken,
            packageName: packageName,
            sport: sport,
            userPrivateToken: getCookie('userToken'),
            basicTier: {
                acces_videos: basicAccesVideos,
                description: basicDescription,
                custom_program: basicCustomProgram,
                coaching_101: basicCoaching,
                recurring: basicRecurring
            },
            standardTier: {
                acces_videos: standardAccesVideos,
                description: standardDescription,
                custom_program: standardCustomProgram,
                coaching_101: standardCoaching,
                recurring: standardRecurring
            },
            premiumTier: {
                acces_videos: premiumAccesVideos,
                description: premiumDescription,
                custom_program: premiumCustomProgram,
                coaching_101: premiumCoaching,
                recurring: premiumRecurring
            }
        })

        if (resp.data.error) {
            window.alert(resp.data.errorMsg)
        }

        window.location.reload()
    }

    const deletePackage = async () => {
        const resp = await axios.post(`${process.env.SERVER_BACKEND}/package-manager/delete-package`, {
            packageToken: props.packageToken
        })
        if (resp.data.error) {
            window.alert(resp.data.errorMsg)
        }
    }

    return (
        <div className="flex h-full w-full">
            <div className="m-auto flex lg:h-[30rem] lg:w-[50rem] xl:h-[35rem] xl:w-[65rem] 3xl:h-[50rem] 3xl:w-[80rem]">
                <div className="flex flex-col rounded-2xl bg-[#0000005e] lg:w-[29rem] xl:w-[39rem] 3xl:w-[49rem]">
                    <div className="flex h-28 w-full">
                        <input
                            className="m-auto h-8 w-60 rounded-xl bg-[#474084] indent-3 text-white placeholder:text-white"
                            placeholder="Enter Package Name"
                            value={packageName}
                            onChange={e => setPackageName(e.target.value)}
                        />
                    </div>
                    <hr className="w-full" />
                    <div className="flex h-[75%] w-full flex-col p-5">
                        <h1 className="mt-4 text-white">Add Photos that describe best your package</h1>
                        <div className="mt-4 grid gap-4 lg:grid-cols-1 xl:grid-cols-3 3xl:grid-cols-3">
                            {/* <AddPhotoZone setImageFile={setImage1} imageUrl={image1 ? URL.createObjectURL(image1) : undefined} />
                            <AddPhotoZone setImageFile={setImage2} imageUrl={image2 ? URL.createObjectURL(image2) : undefined} />
                            <AddPhotoZone setImageFile={setImage3} imageUrl={image3 ? URL.createObjectURL(image3) : undefined} />
                            <AddPhotoZone setImageFile={setImage4} imageUrl={image4 ? URL.createObjectURL(image4) : undefined} /> */}
                        </div>
                    </div>
                    <hr className="w-full" />
                    <div className="flex h-[15%]">
                        <div className="m-auto mt-4 flex h-24 w-[35%] flex-col self-center">
                            <h1 className="self-center text-white">Package sport</h1>
                            <OptionPicker
                                label="Select Sport"
                                options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                                value={sport}
                                onChange={value => setSport(value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="ml-auto flex flex-col rounded-2xl bg-[#0000005e] lg:w-[20rem] xl:w-[25rem] 3xl:w-[30rem]">
                    <div className="mt-12 flex justify-around">
                        <SelectableCards
                            Title="BASIC"
                            TabName="Basic"
                            setComponentToShow={setComponentToShow}
                            activeTab={componentToShow}
                            className="ml h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                        />
                        <SelectableCards
                            Title="STANDARD"
                            TabName="Standard"
                            setComponentToShow={setComponentToShow}
                            activeTab={componentToShow}
                            className="h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                        />
                        <SelectableCards
                            Title="PREMIUM"
                            TabName="Premium"
                            setComponentToShow={setComponentToShow}
                            activeTab={componentToShow}
                            className="h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                        />
                    </div>

                    <hr className="w-full" />
                    {renderComponent()}
                    <button
                        className="mb-4 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]"
                        onClick={async () => {
                            await updatePackage()
                        }}
                    >
                        <h1 className="self-center text-lg text-white">Update!</h1>
                    </button>
                    <button
                        className="mb-8 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#b8181294] active:bg-[#66272594]"
                        onClick={async () => {
                            await deletePackage()
                        }}
                    >
                        <h1 className="self-center text-lg text-white">Delete!</h1>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditPackage
