'use client'
import { isLoggedIn } from '@/Auth-Security/Auth'
import PopupCanvas from '@/Components/CommonUi/util/PopupCanvas'
import CreateTierTemplate from '@/Components/Packages/CreateTierTemplate'
import AddPhotoZone from '@/Components/Packages/util/addPhotoZone'
import SelectableCards from '@/Components/UserProfile/util/ProfileTabCards'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page: React.FunctionComponent<any> = props => {
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)
    const [componentToShow, setComponentToShow] = useState<string>('Basic')

    const userToken: string = getCookie('userToken') as string
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

    useEffect(() => {
        /**
         * Get user profile Data
         */
        ;(async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)
        })()
    }, [userToken])

    const renderComponent = () => {
        switch (componentToShow) {
            case 'Basic':
                return (
                    <>
                        <CreateTierTemplate
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
                            setPrice={setBasicPrice}
                        />
                    </>
                )

            case 'Standard':
                return (
                    <>
                        <CreateTierTemplate
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
                            setPrice={setStandardPrice}
                        />
                    </>
                )

            case 'Premium':
                return (
                    <>
                        <CreateTierTemplate
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
                            setPrice={setPremoiumPrice}
                        />
                    </>
                )

            default:
                return <div>No matching component found</div>
        }
    }

    const createPackage = async () => {
        const formData = new FormData()
        if (image1) {
            formData.append('Photo_1', image1)
        }
        if (image2) formData.append('Photo_2', image2)
        if (image3) formData.append('Photo_3', image3)
        if (image4) formData.append('Photo_4', image4)

        if (packageName == '') return window.alert('please enter package name!')

        formData.append('BasicPrice', basicPrice.toString())
        formData.append('basicRecurring', basicRecurring.toString())
        formData.append('basicAccesVideos', basicAccesVideos.toString())
        formData.append('basicCoaching', basicCoaching.toString())
        formData.append('basicCustomProgram', basicCustomProgram.toString())
        formData.append('basicDescription', basicDescription)

        formData.append('StandardPrice', standardPrice.toString())
        formData.append('standardRecurring', standardRecurring.toString())
        formData.append('standardAccesVideos', standardAccesVideos.toString())
        formData.append('standardCoaching', standardCoaching.toString())
        formData.append('standardCustomProgram', standardCustomProgram.toString())
        formData.append('standardDescription', standardDescription)

        formData.append('PremiumPrice', premiumPrice.toString())
        formData.append('premiumRecurring', premiumRecurring.toString())
        formData.append('premiumAccesVideos', premiumAccesVideos.toString())
        formData.append('premiumCoaching', premiumCoaching.toString())
        formData.append('premiumCustomProgram', premiumCustomProgram.toString())
        formData.append('premiumDescription', premiumDescription)

        formData.append('PackageName', packageName)

        formData.append('UserPrivateToken', userToken)

        try {
            const resp = await axios.post(`${process.env.SERVER_BACKEND}/package-manager/create-package`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (resp.data.error == false) {
                router.replace('account')
            }
        } catch (error) {
            console.error('Error creating package:', error)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {userLoggedIn ? (
                <div className="flex m-auto 3xl:w-[80rem] 3xl:h-[50rem] xl:w-[65rem] xl:h-[35rem] lg:w-[50rem] lg:h-[30rem]">
                    <div className="flex bg-[#0000005e] flex-col 3xl:w-[49rem] rounded-2xl xl:w-[39rem] lg:w-[29rem]">
                        <div className="flex w-full h-28">
                            <input
                                className="w-60 rounded-xl placeholder:text-white bg-[#474084] text-white indent-3 h-8 m-auto"
                                placeholder="Enter Package Name"
                                value={packageName}
                                onChange={e => setPackageName(e.target.value)}
                            />
                        </div>
                        <hr className="w-full" />
                        <div className="flex flex-col w-full h-full p-5">
                            <h1 className="text-white mt-4">Add Photos that describe best your package</h1>
                            <div className="mt-4 grid gap-4 lg:grid-cols-1 xl:grid-cols-3 3xl:grid-cols-3">
                                <AddPhotoZone setImageFile={setImage1} />
                                <AddPhotoZone setImageFile={setImage2} />
                                <AddPhotoZone setImageFile={setImage3} />
                                <AddPhotoZone setImageFile={setImage4} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col bg-[#0000005e] 3xl:w-[30rem] ml-auto rounded-2xl xl:w-[25rem] lg:w-[20rem]">
                        <div className="flex mt-12 justify-around">
                            <SelectableCards Title="BASIC" TabName="Basic" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[9rem] h-[3rem] justify-center ml cursor-pointer rounded-t-xl" />
                            <SelectableCards Title="STANDARD" TabName="Standard" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[9rem] h-[3rem] justify-center cursor-pointer rounded-t-xl" />
                            <SelectableCards Title="PREMIUM" TabName="Premium" setComponentToShow={setComponentToShow} className="bg-[#0000003d] w-[9rem] h-[3rem] justify-center cursor-pointer rounded-t-xl" />
                        </div>

                        <hr className="w-full" />
                        {renderComponent()}
                        <button
                            className="self-center w-[85%] h-12 mb-8 bg-[#474084] active:bg-[#3b366c] mt-auto justify-center rounded-xl"
                            onClick={async () => {
                                await createPackage()
                            }}
                        >
                            <h1 className="self-center text-white text-lg">Create!</h1>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex w-full flex-col h-full">
                    <h1 className="text-white self-center mt-[2rem]">Not logged In</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login!</h1>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Page
