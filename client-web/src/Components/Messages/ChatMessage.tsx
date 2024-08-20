import React, { useEffect, useState } from 'react'
import { IChatMessage } from './IChatMessages'
import { getCookie } from 'cookies-next'
import { decode } from 'html-entities'
import Link from 'next/link'

const ChatMessage = (props: IChatMessage) => {
    const [expanded, setExpanded] = useState(false)
    const [hover, setHover] = useState(false)
    const isOwnMessage = props.ownerToken === getCookie('userPublicToken')

    const toggleExpand = () => {
        setExpanded(!expanded)
    }
    const messageToShow = expanded ? props.message : props.message.substring(0, 256)
    const showReadMore = props.message.length > 256 && !expanded
    switch (props.type) {
        case 'text':
            return (
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div
                        className={`relative flex max-w-xs flex-col rounded-lg p-3 ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} break-words`}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        {isOwnMessage && hover && (
                            <div className="flex h-4 w-full">
                                <img
                                    src="/assets/ChatIcons/Edit_Message_Icon.svg"
                                    className="ml-auto mr-2 h-4 w-4 cursor-pointer self-center"
                                    alt="Settings Icon"
                                    onClick={() => {
                                        props.EditMessage
                                    }}
                                />
                                <img
                                    src="/assets/ChatIcons/Delete_Message_Icon.svg"
                                    className="h-4 w-4 cursor-pointer self-center"
                                    alt="Settings Icon "
                                    onClick={() => {
                                        props.DeleteMessage(props.id)
                                    }}
                                />
                            </div>
                        )}
                        <p className="self-center whitespace-pre-wrap">{decode(messageToShow)}</p>
                        {showReadMore && (
                            <button onClick={toggleExpand} className="ml-2 text-blue-400">
                                Read more
                            </button>
                        )}
                        {expanded && (
                            <button onClick={toggleExpand} className="ml-2 text-blue-400">
                                Show less
                            </button>
                        )}
                    </div>
                </div>
            )
        case 'workoutProgram':
            return (
                <Link href={`/plan-view?t=${JSON.parse(decode(messageToShow)).ProgramToken}`}>
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`flex h-[20vh] w-[15vw] max-w-xs break-words rounded-lg bg-[#00000080] p-3`}>
                            <h1 className="m-auto text-lg text-white">{JSON.parse(decode(messageToShow)).ProgramName}</h1>
                        </div>
                    </div>
                </Link>
            )

        default:
            return (
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                    <h1>Message Type Not Suported</h1>
                </div>
            )
    }
}

export default ChatMessage
