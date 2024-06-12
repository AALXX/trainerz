'use client'
import React, { useState } from 'react'
import Image from 'next/image'

import Comment from './Comment'
import { useEffect } from 'react'
import axios from 'axios'
import { ICommentCard, IVideoPlayerProps } from './IcommentSection'
import { getCookie } from 'cookies-next'

const CommentSection = (props: IVideoPlayerProps) => {
    const [commentInput, setCommentInput] = useState<string>('')
    const [videoComments, setVideoComments] = useState<Array<ICommentCard>>([])
    const [hasComments, setHasComments] = useState<boolean>(false)

    const postComment = async () => {
        const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/post-comment`, { UserPrivateToken: props.UserPrivateToken, VideoToken: props.VideoToken, Comment: commentInput })

        if (hasComments == false) {
            setHasComments(true)
        }

        // setVideoComments(videoComments => [...videoComments, { ownerToken: props.UserPublicToken!, videoToken: props.VideoToken!, comment: commentInput, ownerName: res.data.userName }])
    }

    const deleteComment = async (CommentID: number) => {
        const res = await axios.post(`${process.env.SERVER_BACKEND}/videos-manager/delete-comment`, {
            UserPrivateToken: getCookie('userToken'),
            VideoToken: props.VideoToken,
            CommentID: CommentID
        })
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
        <div className="ml-[.5rem] mt-[3rem] flex h-[83.2vh] w-[22vw] flex-col rounded-br-xl rounded-tr-xl bg-[#00000080]">
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
