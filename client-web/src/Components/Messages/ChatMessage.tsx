import React, { useState } from 'react'
import { IChatMessage } from './IChatMessages'
import { getCookie } from 'cookies-next'

const ChatMessage = (props: IChatMessage) => {
    const [expanded, setExpanded] = useState(false)
    const isOwnMessage = props.ownerToken === getCookie('userPublicToken') // Assuming `getCookie` is imported and used to get the current user's token

    const toggleExpand = () => {
        setExpanded(!expanded)
    }
    // console.log(props.ownerToken)
    const messageToShow = expanded ? props.message : props.message.substring(0, 256)
    const showReadMore = props.message.length > 256 && !expanded

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            <div
                className={`max-w-xs rounded-lg p-3 ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} break-words`} // Added break-words class
            >
                <p className="whitespace-pre-wrap">{messageToShow}</p> {/* Added whitespace-pre-wrap class */}
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
}

export default ChatMessage
