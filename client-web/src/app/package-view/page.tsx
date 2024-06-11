'use client'
import { isLoggedIn } from '@/Auth-Security/Auth'
import PhotoViewer from '@/Components/CommonUi/PhotosViewer'
import PopupCanvas from '@/Components/CommonUi/util/PopupCanvas'
import { IPackageData } from '@/Components/Packages/IPackages'
import PackageCheckout from '@/Components/Packages/PackageCheckout'
import PackageTemplate from '@/Components/Packages/PackageTemplate'
import SelectableCards from '@/Components/UserProfile/util/ProfileTabCards'
import getStripe from '@/lib/Stripe'
import { Elements } from '@stripe/react-stripe-js'
import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const PackageView = () => {
    const [componentToShow, setComponentToShow] = useState<string>('Basic')

    const urlParams = useSearchParams() //* t =  search query

    const [checkoutPoUp, setCheckoutPoUp] = useState<boolean>(false)
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)

    // const router = useRouter()

    const [basicTierData, setBasicTierData] = useState<IPackageData>({
        acces_videos: false,
        coaching_101: false,
        custom_program: false,
        description: '',
        price: 0,
        priceId: '',
        recurring: false
    })

    const [standardTierData, setStandardTierData] = useState<IPackageData>({
        acces_videos: false,
        coaching_101: false,
        custom_program: false,
        description: '',
        price: 0,
        priceId: '',
        recurring: false
    })

    const [premiumTierData, setPremiumTierData] = useState<IPackageData>({
        acces_videos: false,
        coaching_101: false,
        custom_program: false,
        description: '',
        price: 0,
        priceId: '',
        recurring: false
    })

    const [packageName, setPackageName] = useState<string>('')
    const [ownerToken, setOwnerToken] = useState<string>('')
    const [rating, setRating] = useState<number>(0)

    const [sport, setSport] = useState<string>('')
    const [selectedPriceId, setSelectedPriceId] = useState<string>('')

    useEffect(() => {
        ;(async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)

            const { data } = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-package-data/${urlParams.get('t') as string}`)
            console.log(data)

            setBasicTierData(data.basicTier)
            setStandardTierData(data.standardTier)
            setPremiumTierData(data.premiumTier)
            
            setSelectedPriceId(data.basicTier.priceId)

            setRating(data.rating)
            setOwnerToken(data.ownerToken)
            setPackageName(data.packageName)
            setSport(data.sport)
        })()
    }, [ownerToken])

    const renderComponent = () => {
        switch (componentToShow) {
            case 'Basic':
                return (
                    <>
                        <PackageTemplate
                            acces_videos={basicTierData.acces_videos}
                            coaching_101={basicTierData.coaching_101}
                            custom_program={basicTierData.custom_program}
                            description={basicTierData.description}
                            recurring={basicTierData.recurring}
                            price={basicTierData.price}
                        />
                    </>
                )

            case 'Standard':
                return (
                    <>
                        <PackageTemplate
                            acces_videos={standardTierData.acces_videos}
                            coaching_101={standardTierData.coaching_101}
                            custom_program={standardTierData.custom_program}
                            description={standardTierData.description}
                            recurring={standardTierData.recurring}
                            price={standardTierData.price}
                        />
                    </>
                )

            case 'Premium':
                return (
                    <>
                        <PackageTemplate
                            acces_videos={premiumTierData.acces_videos}
                            coaching_101={premiumTierData.coaching_101}
                            custom_program={premiumTierData.custom_program}
                            description={premiumTierData.description}
                            recurring={premiumTierData.recurring}
                            price={premiumTierData.price}
                        />
                    </>
                )

            default:
                return <div>No matching component found</div>
        }
    }

    const photos = [
        `${process.env.FILE_SERVER}/${ownerToken}/Package_${urlParams.get('t') as string}/Photo_1.jpg?cache=none`,
        `${process.env.FILE_SERVER}/${ownerToken}/Package_${urlParams.get('t') as string}/Photo_2.jpg?cache=none`,
        `${process.env.FILE_SERVER}/${ownerToken}/Package_${urlParams.get('t') as string}/Photo_3.jpg?cache=none`
    ]

    return (
        <div className="flex flex-col h-full self-center">
            <div className="flex m-auto 3xl:w-[80rem] 3xl:h-[50rem] xl:w-[65rem] xl:h-[35rem] lg:w-[50rem] lg:h-[30rem]">
                <div className="flex bg-[#0000005e] flex-col 3xl:w-[49rem] rounded-2xl xl:w-[39rem] lg:w-[29rem]">
                    <div className="flex w-full flex-grow-0 h-28">
                        <h1 className="m-auto text-white text-lg">{packageName}</h1>
                    </div>
                    <hr className="w-full" />
                    <div className="flex flex-col w-full h-[75%] flex-grow-0 p-5">
                        <PhotoViewer images={photos} />
                    </div>
                    <div className="flex flex-col h-[30%]">
                        <div className="flex">
                            <h1 className="text-white text-lg ml-4">Sport: {sport}</h1>
                            <h1 className="text-white text-lg ml-auto mr-4">Rating: {rating}/5</h1>
                        </div>
                        <hr className="w-full " />
                    </div>
                </div>

                <div className="flex flex-col bg-[#0000005e] 3xl:w-[30rem] ml-auto rounded-2xl xl:w-[25rem] lg:w-[20rem]">
                    <div className="flex mt-12 justify-around">
                        <SelectableCards
                            Title="BASIC"
                            TabName="Basic"
                            setComponentToShow={setComponentToShow}
                            className="bg-[#0000003d] w-[9rem] h-[3rem] justify-center ml cursor-pointer rounded-t-xl"
                            onClick={() => setSelectedPriceId(basicTierData.priceId)}
                        />
                        <SelectableCards
                            Title="STANDARD"
                            TabName="Standard"
                            setComponentToShow={setComponentToShow}
                            className="bg-[#0000003d] w-[9rem] h-[3rem] justify-center cursor-pointer rounded-t-xl"
                            onClick={() => setSelectedPriceId(standardTierData.priceId)}
                        />
                        <SelectableCards
                            Title="PREMIUM"
                            TabName="Premium"
                            setComponentToShow={setComponentToShow}
                            className="bg-[#0000003d] w-[9rem] h-[3rem] justify-center cursor-pointer rounded-t-xl"
                            onClick={() => setSelectedPriceId(premiumTierData.priceId)}
                        />
                    </div>

                    {checkoutPoUp ? (
                        <PopupCanvas
                            closePopup={() => {
                                setCheckoutPoUp(!checkoutPoUp)
                            }}
                        >
                            <Elements stripe={getStripe()}>
                                <PackageCheckout priceId={selectedPriceId}/>
                            </Elements>
                        </PopupCanvas>
                    ) : null}
                    <hr className="w-full" />
                    {renderComponent()}
                    {userLoggedIn ? (
                        <button
                            className="self-center w-[85%] h-12 mb-8 bg-[#474084] active:bg-[#3b366c] mt-auto justify-center rounded-xl"
                            onClick={async () => {
                                setCheckoutPoUp(true)
                            }}
                        >
                            <h1 className="self-center text-white text-lg">Checkout!</h1>
                        </button>
                    ) : (
                        <Link href={'/account/login-register'} className="flex self-center w-[85%] h-12 mb-8 bg-[#474084] active:bg-[#3b366c] mt-auto justify-center rounded-xl">
                            <h1 className="self-center text-white text-lg m-auto">Login to checkout!</h1>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PackageView
