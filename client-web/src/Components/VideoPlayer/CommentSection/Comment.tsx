import Link from 'next/link'
import React from 'react'
import { ICommentCard } from './IcommentSection'
import ImgWithAuth from '@/Components/CommonUi/ImageWithAuth'

const Comment = (props: ICommentCard) => {
    return (
        <div className="mt-[1rem] flex h-[8.5rem] w-[95%] flex-shrink-0 flex-col self-center rounded-xl bg-[#00000080] p-2">
            <div className="flex h-[4rem] w-full">
                <Link className="ml-2 mt-2" href={`/user?id=${props.ownerToken}`}>
                    <ImgWithAuth className="z-10 rounded-full" src={`${process.env.FILE_SERVER}/${props.ownerToken}/Main_Icon.png`} width={40} height={40} alt="Picture of the author" />
                </Link>
                <h2 className="ml-2 mt-4 text-white">{props.ownerName}</h2>
                {props.ownerToken == props.viwerPublicToken && (
                    <button
                        className="ml-auto flex h-10 w-16 rounded-xl bg-red-800"
                        onClick={async () => {
                            await props.DeleteComment(props.id)
                        }}
                    >
                        <h1 className="m-auto text-white">Delete!</h1>
                    </button>
                )}
            </div>

            <hr className="mt-2" />
            <textarea className="mt-2 h-16 w-full resize-none bg-transparent indent-2 text-sm text-white" readOnly>
                {props.comment}
            </textarea>
        </div>
    )
}

export default Comment
