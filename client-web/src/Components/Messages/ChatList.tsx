import React from 'react'
import { IChatList } from './IChatMessages'

const ChatList = (props: IChatList) => {
    return (
        <div className="flex h-full w-[20rem] flex-col border-r">
            {props.conversations != null && (
                <>
                    {props.conversations.map((conversation, index) => (
                        <div
                            className="mt-2 flex h-24 w-full flex-col bg-[#0000005e]"
                            key={index}
                            onClick={() => {
                                props.socket.emit('leave-chat', props.selectedChatToken)
                                props.setChatToken(conversation.chatToken)
                                props.socket.emit('join-chat', conversation.chatToken)
                            }}
                        >
                            <h1 className="ml-3 mt-3 text-lg text-white">
                                {conversation.athleteUserName} and {conversation.trainerUserName}
                            </h1>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}

export default ChatList
