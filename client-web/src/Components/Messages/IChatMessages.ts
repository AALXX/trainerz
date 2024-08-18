import { Dispatch, SetStateAction } from 'react'
import { Socket } from 'socket.io-client'

export interface IChatMessage {
    id: string
    message: string
    ownerToken: string
    chatToken: string
    type: string
    sentat: Date
    DeleteMessage: (message: TChatMessage) => void
    EditMessage: (message: TChatMessage) => void
}

export type TChatMessage = Omit<IChatMessage, 'DeleteMessage' | 'EditMessage'>

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

export interface IWorkoutProgramButton {
    programtoken: string
    programname: string
    sendAttachment: (e: React.FormEvent, programToken: string, programName: string) => void
}

