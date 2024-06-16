import Link from 'next/link'
import React from 'react'
import { IAccountProfile } from './ISearchSystem'
import TruncatedText from '../CommonUi/util/TruncateText'

const AccountProfileCard = (props: IAccountProfile) => {
    return (
        <Link href={`/user?id=${props.UserPublicToken}`} className="relative h-0 w-full overflow-hidden pb-[60%]">
            <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col rounded-2xl bg-[#00000080] p-4">
                <div className="flex w-full">
                    <img src={`${process.env.FILE_SERVER}/${props.UserPublicToken}/Main_icon.png?cache=none`} className="h-[4rem] w-[4rem] rounded-full object-cover" />
                    <div className="ml-4 flex w-full flex-col self-center">
                        <div className="flex">
                            <h1 className="text-white">{props.UserName}</h1>
                            <h1 className="ml-auto text-white">{props.Rating}/5</h1>
                            <img className="z-10 ml-1 h-6 w-6 self-center text-white" src={`/assets/AccountIcons/Star_Icon.svg`} alt="Picture of the author" />
                        </div>
                        <hr className="w-full" />
                        <div className="flex w-full">
                            <TruncatedText className="text-white" characters={20} text={props.Sport} />
                            <h1 className="ml-2 text-white">Coach </h1>
                        </div>
                    </div>
                </div>
                <textarea className="mt-6 h-full cursor-pointer resize-none rounded-2xl bg-[#474084] indent-3 text-white" readOnly value={props.AccountDescription} />
            </div>
        </Link>
    )
}

export default AccountProfileCard
