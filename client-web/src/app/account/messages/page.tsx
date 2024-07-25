'use client'
import ChatList from '@/Components/Messages/ChatList'
import useSocket from '@/hooks/useSocket'
import { getCookie } from 'cookies-next'
import React, { Suspense, useEffect, useState } from 'react'
import { IConversations } from '@/Components/Messages/IChatMessages'
import ChatArea from '@/Components/Messages/ChatArea'

const Messages = () => {
    const socket = useSocket()

    const [chatConversations, setChatConversations] = useState<IConversations[]>([])
    const [selectedChatToken, setSelectedChatToken] = useState<string>('')

    useEffect(() => {
        if (!socket) {
            console.error('Socket is not initialized')
            return
        }

        socket.on('connect', () => {
            console.log('Connected to chat server')
        })

        socket.emit('get-chats', { userPrivateToken: getCookie('userToken') })

        socket.on('account-chats', (data) => {
            console.log('Chat tokens received:', data)
            setChatConversations(data)
        })

        return () => {
            socket.off('connect')
            socket.off('account-chats')
        }
    }, [socket])

    if (!socket) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex h-full">
            <ChatList conversations={chatConversations} setChatToken={setSelectedChatToken} selectedChatToken={selectedChatToken} socket={socket!} />
            <Suspense fallback={<div>Loading chat area...</div>}>
                <ChatArea chattoken={selectedChatToken} socket={socket!} />
            </Suspense>
        </div>
    )
}

export default Messages