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
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const PackageView = () => {
    const [componentToShow, setComponentToShow] = useState<string>('Basic')
    const { isLoggedIn, checkStatus } = useAccountStatus()
    const urlParams = useSearchParams()
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
    const [rating, setRating] = useState<number>(0)
    const [sport, setSport] = useState<string>('')
    const [selectedPriceId, setSelectedPriceId] = useState<string>('')

    const [found, setFound] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            await checkStatus()

            const { data } = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-package-data/${urlParams.get('t') as string}`)
            if (data == null) {
                setFound(false)
                return
            }
            setFound(true)

            const newPhotos = Array.from({ length: data.photosNumber }, (_, i) => `${process.env.FILE_SERVER}/${data.ownerToken}/Package_${urlParams.get('t') as string}/Photo_${i + 1}.jpg?cache=none`)

            setPhotos(newPhotos)
            setBasicTierData(data.basicTier)
            setStandardTierData(data.standardTier)
            setPremiumTierData(data.premiumTier)

            setSelectedPriceId(data.basicTier.priceId)

            setRating(data.rating)
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

    if (!found) {
        return (
            <div className="flex h-screen flex-col">
                <h1 className="mt-5 self-center text-white">Package not found</h1>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col self-center p-4 overflow-y-scroll lg:overflow-y-hidden">
            <div className="m-auto flex w-full max-w-7xl flex-col lg:flex-row">
                <div className="mb-4 flex w-full flex-col rounded-2xl bg-[#0000005e] h-[40rem] sm:h-[30rem] lg:mb-0 lg:mr-4 lg:h-[40rem] 3xl:h-[50rem]">
                    <div className="flex h-16 w-full flex-grow-0 items-center justify-center">
                        <h1 className="text-lg text-white md:text-xl lg:text-2xl">{packageName}</h1>
                    </div>
                    <hr className="w-full border-gray-400" />
                    <div className="flex w-full flex-col p-4">
                        <PhotoViewer images={photos} />
                    </div>
                    <div className="flex h-[40%] lg:h-[20%] 3xl:h-[25%] flex-col">
                        <div className="flex items-center justify-between px-4 py-2">
                            <h1 className="text-lg text-white">Sport: {sport}</h1>
                            <h1 className="text-lg text-white">Rating: {rating}/5</h1>
                        </div>
                        <hr className="w-full border-gray-400" />
                        <PackageReview packageToken={urlParams.get('t') as string} isLoggedIn={isLoggedIn!} />
                    </div>
                </div>

                <div className="flex w-full flex-col rounded-2xl bg-[#0000005e] lg:h-[40rem] lg:w-1/2 3xl:h-[50rem]">
                    <div className="mt-4 flex flex-wrap justify-around lg:mt-12">
                        <SelectableCards
                            Title="BASIC"
                            TabName="Basic"
                            setComponentToShow={setComponentToShow}
                            className="mb-2 h-[3rem] w-[30%] cursor-pointer justify-center rounded-t-xl bg-[#0000003d] lg:mb-0 "
                            onClick={() => setSelectedPriceId(basicTierData.priceId)}
                            activeTab={componentToShow}
                        />
                        <SelectableCards
                            Title="STANDARD"
                            TabName="Standard"
                            setComponentToShow={setComponentToShow}
                            className="mb-2 h-[3rem] w-[30%] cursor-pointer justify-center rounded-t-xl bg-[#0000003d] lg:mb-0"
                            onClick={() => setSelectedPriceId(standardTierData.priceId)}
                            activeTab={componentToShow}
                        />
                        <SelectableCards
                            Title="PREMIUM"
                            TabName="Premium"
                            setComponentToShow={setComponentToShow}
                            className="h-[3rem] w-[30%] cursor-pointer justify-center rounded-t-xl bg-[#0000003d]"
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
