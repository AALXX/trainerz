'use client'
import { isLoggedIn } from '@/Auth-Security/Auth'
import PackageTemplate from '@/Components/Packages/PackageTemplate'
import SelectableCards from '@/Components/UserProfile/util/ProfileTabCards'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { useEffect, useState } from 'react'

const PackageView = () => {
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)
    const [componentToShow, setComponentToShow] = useState<string>('Basic')

    const userToken: string = getCookie('userToken') as string
    // const router = useRouter()

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
                        <PackageTemplate acces_videos={basicAccesVideos} coaching_101={basicCoaching} custom_program={basicCustomProgram} description={basicDescription} recurring={basicRecurring} price={basicPrice} />
                    </>
                )

            case 'Standard':
                return (
                    <>
                        <PackageTemplate
                            acces_videos={standardAccesVideos}
                            coaching_101={standardCoaching}
                            custom_program={standardCustomProgram}
                            description={standardDescription}
                            recurring={standardRecurring}
                            price={standardPrice}
                        />
                    </>
                )

            case 'Premium':
                return (
                    <>
                        <PackageTemplate
                            acces_videos={premiumAccesVideos}
                            coaching_101={premiumCoaching}
                            custom_program={premiumCustomProgram}
                            description={premiumDescription}
                            recurring={premiumRecurring}
                            price={premiumPrice}
                        />
                    </>
                )

            default:
                return <div>No matching component found</div>
        }
    }

    const createPackage = async () => {}

    return (
        <div className="flex flex-col h-full">
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
                    <div className="flex flex-col w-full h-[75%] p-5"></div>
                    <hr className="w-full " />
                    <div className="flex h-[15%]  "></div>
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
                        <h1 className="self-center text-white text-lg">Checkout!</h1>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PackageView
