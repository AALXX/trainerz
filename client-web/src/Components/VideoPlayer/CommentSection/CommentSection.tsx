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
        <div className="flex flex-col ml-[.5rem] mt-[3rem] h-[83.2vh] w-[22vw] bg-[#00000080] rounded-tr-xl  rounded-br-xl">
            <div className="flex flex-col h-[88%] overflow-y-scroll">
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
                className="flex h-[12%] bg-[#00000080] rounded-br-xl"
                onSubmit={e => {
                    //* this is here to post comment on enter press in input box
                    e.preventDefault()
                    postComment()
                }}
            >
                <input type="text" className="h-9 self-center  ml-7 w-[75%] border-2 rounded-xl bg-transparent text-white indent-3" placeholder="Comment" onChange={e => setCommentInput(e.currentTarget.value)} />

                <div
                    className="flex ml-3 w-10  h-9 self-center cursor-pointer bg-transparent rounded-br-xl"
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
