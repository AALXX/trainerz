'use client'
import ChatList from '@/Components/Messages/ChatList'
import useSocket from '@/hooks/useSocket'
import { getCookie } from 'cookies-next'
import React, { Suspense, useEffect, useState } from 'react'
import { IConversations } from '@/Components/Messages/IChatMessages'
import ChatArea from '@/Components/Messages/ChatArea'
import { useAccountStatus } from '@/hooks/useAccount'
import Link from 'next/link'

const Messages = () => {
    const socket = useSocket()
    const { isLoggedIn, checkStatus } = useAccountStatus()

    const [chatConversations, setChatConversations] = useState<IConversations[]>([])
    const [selectedChatToken, setSelectedChatToken] = useState<string>('')

    useEffect(() => {
        ;(async () => {
            if ((await checkStatus()) == false) {
                return
            }
        })()

        if (!socket) {
            console.error('Socket is not initialized')
            return
        }

        socket.on('connect', () => {
            console.log('Connected to chat server')
        })

        socket.emit('get-chats', { userPrivateToken: getCookie('userToken') })

        socket.on('account-chats', data => {
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
            {isLoggedIn ? (
                <>
                    <ChatList conversations={chatConversations} setChatToken={setSelectedChatToken} selectedChatToken={selectedChatToken} socket={socket!} />
                    <Suspense fallback={<div>Loading chat area...</div>}>
                        <ChatArea chattoken={selectedChatToken} socket={socket!} />
                    </Suspense>
                </>
            ) : (
                <div className="flex h-full w-full flex-col">
                    <h1 className="mt-[2rem] self-center text-white">Not logged In</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login!</h1>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Messages
