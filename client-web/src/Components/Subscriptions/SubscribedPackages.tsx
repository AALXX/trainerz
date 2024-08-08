import React, { useState } from 'react'
import { ISubscriptions } from './ISubscriptions'
import Link from 'next/link'
import TruncatedText from '../CommonUi/util/TruncateText'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import ImgWithAuth from '../CommonUi/ImageWithAuth'

const SubscribedPackageTemplate = (props: ISubscriptions) => {
    const handleCancelClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault() // Prevent the default action
        e.stopPropagation() // Stop the click event from propagating to the Link component

        const res = await axios.post(`${process.env.SERVER_BACKEND}/payment-manager/cancel-subscription`, {
            PackageToken: props.packagetoken,
            UserPrivateToken: getCookie('userToken')
        })

        if (res.data.error) {
            window.alert(res.data.errmsg)
        }

        location.reload()
    }

    return (
        <Link href={`/package-view?t=${props.packagetoken}`} className="relative h-0 w-full overflow-hidden pb-[60%]">
            <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col rounded-2xl bg-white">
                <ImgWithAuth src={`${process.env.FILE_SERVER}/${props.ownertoken}/Package_${props.packagetoken}/Photo_1.jpg?cache=none`} className="h-full w-full rounded-2xl object-cover" />
                <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between">
                    <div className="flex justify-end p-2">
                        <button className="z-20 rounded-xl bg-red-800 p-2 text-white" onClick={handleCancelClick}>
                            Cancel
                        </button>
                    </div>
                    <div className="flex h-16 items-center rounded-b-2xl bg-black bg-opacity-60 p-2">
                        <ImgWithAuth className="flex h-11 w-11 rounded-full" src={`${process.env.FILE_SERVER}/${props.ownertoken}/Main_icon.png?cache=none`} alt="Picture of the author" />
                        <div className="ml-2 flex h-full w-[80%] flex-col">
                            <div className="flex">
                                <TruncatedText className="text-white" characters={20} text={props.packagename} />
                                <h1 className="ml-auto text-white">{props.rating}/5</h1>
                            </div>
                            <hr className="w-full" />
                            <div className="flex">
                                <TruncatedText className="text-sm text-white" characters={20} text={props.packagesport} />
                                <h1 className="ml-auto text-white">{props.tier} Tier</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default SubscribedPackageTemplate
