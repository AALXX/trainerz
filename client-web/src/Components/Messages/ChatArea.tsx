import React, { useState, useEffect } from 'react'
import { IChatArea, IChatMessage } from './IChatMessages'
import { getCookie } from 'cookies-next'
import ChatMessage from './ChatMessage'

const ChatArea = (props: IChatArea) => {
    const [message, setMessage] = useState<string>('')
    const [chatMessages, setChatMessages] = useState<IChatMessage[]>([])

    useEffect(() => {
        if (props.socket == null) return
        props.socket.on('message', (msg: IChatMessage) => {
            setChatMessages(prevMessages => [...prevMessages, msg])
        })

        props.socket.on('messages', (messages: IChatMessage[]) => {
            setChatMessages([])
            if (messages != null) {
                setChatMessages(prevMessages => [...prevMessages, ...messages])
            }
        })

        return () => {
            props.socket.off('message')
            props.socket.off('messages')
        }
    }, [props.socket])

    const SendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const userPublicToken = getCookie('userPublicToken') as string
        const userPrivateToken = getCookie('userToken') as string

        if (message.trim() === '') return // Prevent sending empty messages

        props.socket.emit('chat message', { message: message, UserPrivateToken: userPrivateToken, ChatToken: props.chattoken })

        setChatMessages(prevMessages => [...prevMessages, { message: message, ownerToken: userPublicToken, chatToken: props.chattoken }])
        setMessage('') // Clear input after sending
    }

    return (
        <div className="flex h-[90vh] w-full flex-col">
            <div className="m-auto h-[85%] w-[90%] flex-grow-0 self-center overflow-y-scroll">
                {chatMessages.map((message: IChatMessage, index: number) => (
                    <ChatMessage key={index} chatToken={message.chatToken} ownerToken={message.ownerToken} message={message.message} />
                ))}
            </div>

            <form className="mb-2 mt-auto flex h-20 w-full" onSubmit={SendMessage}>
                <input
                    className="m-auto h-14 w-[90%] rounded-3xl bg-[#00000080] indent-3 text-white"
                    maxLength={256}
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
            </form>
        </div>
    )
}

export default ChatArea
