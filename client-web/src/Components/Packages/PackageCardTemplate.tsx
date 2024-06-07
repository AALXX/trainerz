import React from 'react'
import { IAccountPackages } from './IPackages'
import Link from 'next/link'
import TruncatedText from '../CommonUi/util/TruncateText'

const PackageCardTemplate = (props: IAccountPackages) => {
    return (
        <Link href={`/package-view?t=${props.ownertoken}`} className="relative w-full h-0 pb-[60%] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full flex flex-col bg-white cursor-pointer rounded-2xl">
                <img src={`${process.env.FILE_SERVER}/${props.ownertoken}/Package_${props.packagetoken}/Photo_1.jpg?cache=none`} className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between ">
                    <div className="flex justify-end p-2">
                        {props.isOwner ? (
                            <Link href={`/account/edit-package?t=${props.packagetoken}`} className="self-center">
                                <img src="/assets/AccountIcons/Settings_icon.svg" width={20} height={20} alt="Settings Icon" />
                            </Link>
                        ) : null}
                    </div>
                    <div className="flex items-center p-2 bg-black bg-opacity-60 h-16 rounded-b-2xl">
                        <img className="flex rounded-full w-11 h-11" src={`${process.env.FILE_SERVER}/${props.ownertoken}/Main_icon.png?cache=none`} alt="Picture of the author" />
                        <div className="flex flex-col h-full ml-2">
                            <TruncatedText className="text-white " characters={20} text={props.packagename} />
                            <hr />
                            <TruncatedText className="text-white text-sm " characters={20} text={props.packagesport} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default PackageCardTemplate
