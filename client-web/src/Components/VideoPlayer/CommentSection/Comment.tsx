import Link from 'next/link'
import React from 'react'
import { ICommentCard } from './IcommentSection'

const Comment = (props: ICommentCard) => {
    return (
        <div className="flex flex-col bg-[#00000080] h-[8.5rem] w-[95%] mt-[1rem] self-center flex-shrink-0 rounded-xl p-2">
            <div className="flex  w-full h-[4rem]">
                <Link className="ml-2 mt-2" href={`/user?id=${props.ownerToken}`}>
                    <img className="z-10 rounded-full" src={`${process.env.FILE_SERVER}/${props.ownerToken}/Main_Icon.png`} width={40} height={40} alt="Picture of the author" />
                </Link>
                <h2 className="text-white mt-4 ml-2">{props.ownerName}</h2>
                {props.ownerToken == props.viwerPublicToken && (
                    <button
                        className="flex bg-red-800 h-10 w-16 rounded-xl ml-auto"
                        onClick={async () => {
                            await props.DeleteComment(props.id)
                        }}
                    >
                        <h1 className="text-white m-auto">Delete!</h1>
                    </button>
                )}
            </div>

            <hr className="mt-2" />
            <textarea className="text-white mt-2 text-sm bg-transparent  h-16 w-full resize-none indent-2" readOnly>
                {props.comment}
            </textarea>
        </div>
    )
}

export default Comment
