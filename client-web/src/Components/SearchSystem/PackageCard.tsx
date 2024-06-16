import Link from 'next/link'
import React from 'react'
import { IPackageCard } from './ISearchSystem'
import TruncatedText from '../CommonUi/util/TruncateText'

const PackageCard = (props: IPackageCard) => {
    return (
        <Link href={`/package-view?t=${props.PackageToken}`} className="relative h-0 w-full overflow-hidden pb-[60%]">
            <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col rounded-2xl bg-white">
                <img src={`${process.env.FILE_SERVER}/${props.OwnerToken}/Package_${props.PackageToken}/Photo_1.jpg?cache=none`} className="h-full w-full rounded-2xl object-cover" />
                <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between">
                    <div className="mt-auto flex h-16 items-center rounded-b-2xl bg-black bg-opacity-60 p-2">
                        <img className="flex h-11 w-11 rounded-full" src={`${process.env.FILE_SERVER}/${props.OwnerToken}/Main_icon.png?cache=none`} alt="Picture of the author" />
                        <div className="ml-2 flex h-full flex-col">
                            <TruncatedText className="text-white" characters={20} text={props.PackageName} />
                            <hr />
                            <TruncatedText className="text-sm text-white" characters={20} text={props.PackageSport} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>

    )
}

export default PackageCard
