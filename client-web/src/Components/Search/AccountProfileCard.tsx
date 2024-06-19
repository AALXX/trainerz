import React from 'react'
import Link from 'next/link'
import TruncatedText from '../CommonUi/util/TruncateText'
import { IAccountProfileTemplate } from './ISearch'

const AccountProfileCardTemplate = (props: IAccountProfileTemplate) => {
    return (
        <Link href={`/user?id=${props.UserPublicToken}`} className="relative h-0 w-full overflow-hidden pb-[60%]">
            <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col rounded-2xl bg-[#00000080] p-4">
                <div className="flex">
                    <img className="flex h-16 w-16 self-center rounded-full" src={`${process.env.FILE_SERVER}/${props.UserPublicToken}/Main_icon.png?cache=none`} alt="Picture of the author" />
                    <div className="ml-4 flex h-full w-full flex-col">
                        <div className="flex">
                            <TruncatedText className="text-white" characters={20} text={props.UserName} />
                            <h1 className="ml-auto text-white">{props.Rating} / 5</h1>
                        </div>
                        <hr />
                        <h1 className="text-white">{props.Sport} Coach</h1>
                    </div>
                </div>
                <div className="mt-4  h-[50%]">
                    <textarea
                        className="mt-2 indent-3 resize-none rounded-xl bg-[#474084] text-white w-full h-full cursor-pointer"
                        placeholder="Description"
                        value={props.AccountDescription}
                        readOnly={false}
                    />
                </div>
            </div>
        </Link>
    )
}

export default AccountProfileCardTemplate
