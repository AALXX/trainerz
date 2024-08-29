'use client'
import PhotoViewer from '@/Components/CommonUi/PhotosViewer'
import PopupCanvas from '@/Components/CommonUi/util/PopupCanvas'
import { IPackageData } from '@/Components/Packages/IPackages'
import PackageCheckout from '@/Components/Packages/PackageCheckout'
import PackageReview from '@/Components/Packages/PackageReview'
import PackageTemplate from '@/Components/Packages/PackageTemplate'
import SelectableCards from '@/Components/UserProfile/util/ProfileTabCards'
import { useAccountStatus } from '@/hooks/useAccount'
import getStripe from '@/lib/Stripe'
import { Elements } from '@stripe/react-stripe-js'
import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

const PackageView = () => {
    const [componentToShow, setComponentToShow] = useState<string>('Basic')
    const { isLoggedIn, checkStatus } = useAccountStatus()
    const urlParams = useSearchParams() //* t =  search query
    const [checkoutPoUp, setCheckoutPoUp] = useState<boolean>(false)
    const [photos, setPhotos] = useState<string[]>([])

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
            await checkStatus()

            const { data } = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-package-data/${urlParams.get('t') as string}`)
            const newPhotos = Array.from({ length: data.photosNumber }, (_, i) => `${process.env.FILE_SERVER}/${data.ownerToken}/Package_${urlParams.get('t') as string}/Photo_${i + 1}.jpg?cache=none`)

            setPhotos(newPhotos)
            setBasicTierData(data.basicTier)
            setStandardTierData(data.standardTier)
            setPremiumTierData(data.premiumTier)

            setSelectedPriceId(data.basicTier.priceId)

            setRating(data.rating)
            setOwnerToken(data.ownerToken)
            setPackageName(data.packageName)
            setSport(data.sport)
        })()
    }, [urlParams])

    const renderComponent = () => {
        switch (componentToShow) {
            case 'Basic':
                return (
                    <PackageTemplate
                        acces_videos={basicTierData.acces_videos}
                        coaching_101={basicTierData.coaching_101}
                        custom_program={basicTierData.custom_program}
                        description={basicTierData.description}
                        recurring={basicTierData.recurring}
                        price={basicTierData.price}
                    />
                )

            case 'Standard':
                return (
                    <PackageTemplate
                        acces_videos={standardTierData.acces_videos}
                        coaching_101={standardTierData.coaching_101}
                        custom_program={standardTierData.custom_program}
                        description={standardTierData.description}
                        recurring={standardTierData.recurring}
                        price={standardTierData.price}
                    />
                )

            case 'Premium':
                return (
                    <PackageTemplate
                        acces_videos={premiumTierData.acces_videos}
                        coaching_101={premiumTierData.coaching_101}
                        custom_program={premiumTierData.custom_program}
                        description={premiumTierData.description}
                        recurring={premiumTierData.recurring}
                        price={premiumTierData.price}
                    />
                )

            default:
                return <div>No matching component found</div>
        }
    }

    return (
        <div className="flex h-full flex-col self-center w-full">
            <div className="m-auto flex lg:h-[30rem] lg:w-[60rem] xl:h-[40rem] xl:w-[85%] 3xl:h-[50rem] 3xl:w-[80rem] ">
                <div className="flex flex-col rounded-2xl bg-[#0000005e] lg:w-[29rem] xl:w-[39rem] 2xl:w-[49rem]">
                    <div className="flex w-full items-center justify-center xl:h-16 3xl:h-24">
                        <h1 className="text-lg text-white">{packageName}</h1>
                    </div>
                    <hr className="w-full border-gray-400" />
                    <div className="flex w-full flex-col p-5">
                        <PhotoViewer images={photos} />
                    </div>
                    <div className="flex h-[10rem] flex-col">
                        <div className="flex items-center justify-between px-4 py-2">
                            <h1 className="text-lg text-white">Sport: {sport}</h1>
                            <h1 className="text-lg text-white">Rating: {rating}/5</h1>
                        </div>
                        <hr className="w-full border-gray-400" />
                        <PackageReview packageToken={urlParams.get('t') as string} isLoggedIn={isLoggedIn!} />
                    </div>
                </div>

                <div className="ml-auto flex flex-col rounded-2xl bg-[#0000005e] lg:w-[20rem] xl:w-[25rem] 2xl:w-[30rem]">
                    <div className="mt-12 flex justify-around">
                        <SelectableCards
                            Title="BASIC"
                            TabName="Basic"
                            setComponentToShow={setComponentToShow}
                            className="ml h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                            onClick={() => setSelectedPriceId(basicTierData.priceId)}
                            activeTab={componentToShow}
                        />
                        <SelectableCards
                            Title="STANDARD"
                            TabName="Standard"
                            setComponentToShow={setComponentToShow}
                            className="h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                            onClick={() => setSelectedPriceId(standardTierData.priceId)}
                            activeTab={componentToShow}
                        />
                        <SelectableCards
                            Title="PREMIUM"
                            TabName="Premium"
                            setComponentToShow={setComponentToShow}
                            className="h-[3rem] w-[9rem] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
                            onClick={() => setSelectedPriceId(premiumTierData.priceId)}
                            activeTab={componentToShow}
                        />
                    </div>

                    {checkoutPoUp ? (
                        <PopupCanvas
                            closePopup={() => {
                                setCheckoutPoUp(!checkoutPoUp)
                            }}
                        >
                            <Elements stripe={getStripe()}>
                                <PackageCheckout priceId={selectedPriceId} />
                            </Elements>
                        </PopupCanvas>
                    ) : null}

                    <hr className="w-full" />
                    {renderComponent()}
                    {isLoggedIn ? (
                        <button
                            className="mb-8 mt-auto h-12 w-[90%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]"
                            onClick={async () => {
                                setCheckoutPoUp(true)
                            }}
                        >
                            <h1 className="self-center text-lg text-white">Checkout!</h1>
                        </button>
                    ) : (
                        <Link href={'/account/login-register'} className="mb-8 mt-auto flex h-12 w-[90%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]">
                            <h1 className="m-auto self-center text-lg text-white">Login to checkout!</h1>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PackageView
