'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCookie } from 'cookies-next'
import { abbreviateNumber } from '@/Components/CommonUi/util/NumberAbrev'
import { IVideoTemplate } from '../IAccountProfile'
import TruncatedText from '@/Components/CommonUi/util/TruncateText'

export const VideoTemplate = (props: IVideoTemplate) => {
    const [isHovered, setIsHovered] = useState<boolean>(false)

    return (
        <Link href={`/watch?vt=${props.videotoken}`} className="relative w-full h-0 pb-[60%] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full flex flex-col bg-white cursor-pointer" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <img src={`${process.env.FILE_SERVER}/${props.ownertoken}/${props.videotoken}/Thumbnail_image.jpg`} className="w-full h-full object-cover" />
                {isHovered && (
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between ">
                        <div className="flex justify-end p-2">
                            {props.isOwner ? (
                                <Link href={`/account/edit-video?vt=${props.videotoken}`} className="self-center">
                                    <Image src="/assets/AccountIcons/Settings_icon.svg" width={20} height={20} alt="Settings Icon" />
                                </Link>
                            ) : null}
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black bg-opacity-60 h-14">
                            <div>
                                <TruncatedText className="text-white " characters={20} text={props.videotitle} />
                                <hr />
                                <TruncatedText className="text-white text-sm " characters={20} text={props.sportname} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                    <Image src="/assets/PlayerIcons/Like_icon.svg" width={20} height={20} alt="Like Icon" />
                                    <h1 className="text-white ml-1">{abbreviateNumber(props.likes)}</h1>
                                </div>
                                <div className="flex items-center">
                                    <Image src="/assets/PlayerIcons/Dislike_icon.svg" width={20} height={20} alt="Dislike Icon" />
                                    <h1 className="text-white ml-1">{abbreviateNumber(props.dislikes)}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default VideoTemplate
