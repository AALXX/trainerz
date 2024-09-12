import React from 'react'
import { IAccountPackages } from './IPackages'
import Link from 'next/link'
import TruncatedText from '../CommonUi/util/TruncateText'
import ImgWithAuth from '../CommonUi/ImageWithAuth'

const PackageCardTemplate = (props: IAccountPackages) => {
    return (
        <Link href={`/package-view?t=${props.packagetoken}`} className="relative h-64 w-full overflow-hidden">
            <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col rounded-2xl bg-white">
                <ImgWithAuth src={`${process.env.FILE_SERVER}/${props.ownertoken}/Package_${props.packagetoken}/Photo_1.jpg?cache=none`} className="h-full w-full rounded-2xl object-cover" alt="package image" />
                <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between">
                    <div className="flex justify-end p-2">
                        {props.isOwner ? (
                            <Link href={`/account/edit-package?t=${props.packagetoken}`} className="self-center">
                                <img src="/assets/AccountIcons/Settings_icon.svg" width={20} height={20} alt="Settings Icon" />
                            </Link>
                        ) : null}
                    </div>
                    <div className="flex  items-center rounded-b-2xl bg-black bg-opacity-60 p-2">
                        <ImgWithAuth className="h-11 w-11 rounded-full" src={`${process.env.FILE_SERVER}/${props.ownertoken}/Main_icon.png?cache=none`} alt="Picture of the author" />
                        <div className="ml-2 flex h-full w-[80%] flex-col">
                            <div className="flex items-center justify-between">
                                <TruncatedText className="text-white" characters={20} text={props.packagename} />
                                <div className="flex items-center">
                                    <h1 className="text-white">{props.rating}/5</h1>
                                    <img src="/assets/AccountIcons/Star_icon.svg" width={25} height={25} className="ml-1" alt="Star Icon" />
                                </div>
                            </div>
                            <hr className="my-1" />
                            <TruncatedText className="text-sm text-white" characters={20} text={props.packagesport} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default PackageCardTemplate
