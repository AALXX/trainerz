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
        <Link href={`/watch?vt=${props.videotoken}`} className="relative h-0 w-full overflow-hidden pb-[60%]">
            <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col rounded-2xl bg-white" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <img src={`${process.env.FILE_SERVER}/${props.ownertoken}/${props.videotoken}/Thumbnail_image.jpg`} className="h-full w-full rounded-2xl object-cover" />
                {isHovered && (
                    <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between">
                        <div className="flex justify-end p-2">
                            {props.isOwner ? (
                                <Link href={`/account/edit-video?vt=${props.videotoken}`} className="self-center">
                                    <Image src="/assets/AccountIcons/Settings_icon.svg" width={20} height={20} alt="Settings Icon" />
                                </Link>
                            ) : null}
                        </div>
                        <div className="flex h-14 items-center justify-between bg-black bg-opacity-60 p-2 rounded-b-2xl">
                            <div>
                                <TruncatedText className="text-white" characters={20} text={props.videotitle} />
                                <hr />
                                <TruncatedText className="text-sm text-white" characters={20} text={props.packagesport} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                    <Image src="/assets/PlayerIcons/Like_icon.svg" width={20} height={20} alt="Like Icon" />
                                    <h1 className="ml-1 text-white">{abbreviateNumber(props.likes)}</h1>
                                </div>
                                <div className="flex items-center">
                                    <Image src="/assets/PlayerIcons/Dislike_icon.svg" width={20} height={20} alt="Dislike Icon" />
                                    <h1 className="ml-1 text-white">{abbreviateNumber(props.dislikes)}</h1>
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
