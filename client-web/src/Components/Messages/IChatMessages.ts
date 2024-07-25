import { Dispatch, SetStateAction } from 'react'
import { Socket } from 'socket.io-client'

export interface IChatMessage {
    message: string
    ownerToken: string
    chatToken: string
}

export interface IChatArea {
    chattoken: string
    socket: Socket
}

export interface IConversations {
    // id: number
    chatToken: string
    otherAccountToken: string
    athleteUserName: string
    trainerUserName: string
}

export interface IChatList {
    conversations: IConversations[]
    socket: Socket,
    selectedChatToken: string
    setChatToken: Dispatch<SetStateAction<string>>
}
