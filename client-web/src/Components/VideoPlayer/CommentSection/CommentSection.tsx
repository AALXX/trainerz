'use client'
import React, { useState } from 'react'
import Image from 'next/image'

import Comment from './Comment'
import { useEffect } from 'react'
import axios from 'axios'
import { ICommentCard, ICommentSection } from './IcommentSection'
import { getCookie } from 'cookies-next'

const CommentSection = (props: ICommentSection) => {
    const [commentInput, setCommentInput] = useState<string>('')
    const [videoComments, setVideoComments] = useState<Array<ICommentCard>>([])
    const [hasComments, setHasComments] = useState<boolean>(false)
    const [hover, setHover] = useState<boolean>(false)

    const deleteComment = async (CommentID: number) => {
        const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/delete-comment`, {
            UserPrivateToken: getCookie('userToken'),
            VideoToken: props.VideoToken,
            CommentID: CommentID
        })
        // setVideoComments(videoComments.filter((comment) => comment.CommentID !== CommentID))
    }

    const postComment = async () => {
        const resp = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/post-comment`, { UserPrivateToken: getCookie('userToken'), VideoToken: props.VideoToken, Comment: commentInput })

        if (resp.data.error) {
            return
        }

        if (hasComments == false) {
            setHasComments(true)
        }

        console.log(resp.data)

        setCommentInput('')
        setVideoComments(videoComments => [...videoComments, { comment: commentInput, ownerName: resp.data.userName,  id: 0, ownerToken: getCookie('userPublicToken') as string, viwerPublicToken: '' }])
    }

    useEffect(() => {
        ;(async () => {
            const getCommentsForVideo = await axios.get(`${process.env.SERVER_BACKEND}/videos-manager/get-video-comments/${props.VideoToken}`)
            if (getCommentsForVideo.data.CommentsFound === true) {
                setHasComments(true)
                setVideoComments(getCommentsForVideo.data.comments)
            }
        })()
    }, [])

    return (
        <div className="rounded-br-xlrounded-tr-xl ml-[.5rem] mt-[3rem] flex h-[83.2vh] w-[22vw] flex-col overflow-y-hidden rounded-br-2xl rounded-tr-2xl bg-[#00000080]">
            <div
                className={`flex h-24 flex-col rounded-tr-2xl bg-[#00000080] transition-all duration-300 ease-in-out ${hover ? 'translate-y-0' : '-translate-y-14'} p-2`}
                onMouseOver={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div className="flex w-full">
                    <h1 className="self-center text-xl text-white">package: {props.PackageName}</h1>
                    <h1 className="ml-auto self-center text-xl text-white">{props.PackageRating}/5</h1>
                    <img src="/assets/AccountIcons/Star_Icon.svg" className="h-8 w-8 self-center" alt="Star Icon" />
                </div>
                <h1 className="mt-auto self-center text-sm text-white">See Details About The Package</h1>
            </div>
            <div className="flex h-[88%] flex-col overflow-y-scroll">
                {hasComments ? (
                    <>
                        {videoComments.map((comment: ICommentCard, index: number) => (
                            <Comment
                                viwerPublicToken={getCookie('userPublicToken') as string}
                                key={index}
                                id={comment.id}
                                ownerToken={comment.ownerToken}
                                comment={comment.comment}
                                ownerName={comment.ownerName}
                                DeleteComment={() => {
                                    deleteComment(comment.id)
                                }}
                            />
                        ))}
                    </>
                ) : (
                    <></>
                )}
            </div>
            <form
                className="flex h-[12%] rounded-br-xl bg-[#00000080]"
                onSubmit={e => {
                    //* this is here to post comment on enter press in input box
                    e.preventDefault()
                    postComment()
                }}
            >
                <input type="text" className="ml-7 h-9 w-[75%] self-center rounded-xl border-2 bg-transparent indent-3 text-white" placeholder="Comment" onChange={e => setCommentInput(e.currentTarget.value)} />

                <div
                    className="ml-3 flex h-9 w-10 cursor-pointer self-center rounded-br-xl bg-transparent"
                    onClick={() => {
                        postComment()
                    }}
                >
                    <Image className="ml-1 self-center" src="/assets/CommentsIcons/SendComment_icon.svg" width={30} height={30} alt="Send image" />
                </div>
            </form>
        </div>
    )
}

export default CommentSection
