import React, { useState, useEffect, useRef } from 'react'
import { IChatArea, IChatMessage, IWorkoutProgramButton, TChatMessage } from './IChatMessages'
import { getCookie } from 'cookies-next'
import ChatMessage from './ChatMessage'
import PopupCanvas from '../CommonUi/util/PopupCanvas'
import axios from 'axios'
import WorkoutPlanButton from './util/WorkoutPlanButton'

const ChatArea = (props: IChatArea) => {
    const [message, setMessage] = useState<string>('')
    const [chatMessages, setChatMessages] = useState<TChatMessage[]>([])
    const [checkoutPoUp, setCheckoutPoUp] = useState<boolean>(false)
    const [programs, setPrograms] = useState<IWorkoutProgramButton[]>([])

    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (props.socket == null) return

        props.socket.on('message', (msg: IChatMessage) => {
            setChatMessages(prevMessages => [...prevMessages, msg])
        })

        props.socket.on('messages', (messages: IChatMessage[]) => {
            if (messages != null) {
                setChatMessages(messages)
            }
        })

        props.socket.on('deleted message', (MessageId: string) => {
            setChatMessages(prevMessages => prevMessages.filter(message => message.id !== MessageId))
        })

        return () => {
            props.socket.off('message')
            props.socket.off('messages')
        }
    }, [props.socket])

    useEffect(() => {
        ;(async () => {
            const res = await axios.get(`${process.env.SERVER_BACKEND}/programs-manager/get-all-programs/${getCookie('userToken')}`)
            setPrograms(res.data.programs)
        })()
    }, [])

    // Scroll to the bottom whenever chatMessages changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const SendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const userPublicToken = getCookie('userPublicToken') as string
        const userPrivateToken = getCookie('userToken') as string

        if (message.trim() === '') return // Prevent sending empty messages

        const newMessage: TChatMessage = {
            id: '',
            message: message,
            ownerToken: userPublicToken,
            chatToken: props.chattoken,
            type: 'text',
            sentat: new Date()
        }

        props.socket.emit('chat message', { Message: newMessage.message, UserPrivateToken: userPrivateToken, ChatToken: props.chattoken, Type: newMessage.type })

        setChatMessages(prevMessages => [...prevMessages, newMessage])
        setMessage('') // Clear input after sending
    }

    const SendAttachment = async (e: React.FormEvent, programToken: string, programName: string) => {
        e.preventDefault()
        const userPrivateToken = getCookie('userToken') as string
        const userPublicToken = getCookie('userPublicToken') as string

        const DataEncodedInString = {
            ProgramToken: programToken,
            ProgramName: programName
        }

        const newMessage: TChatMessage = {
            id: '',
            message: JSON.stringify(DataEncodedInString).toString(),
            ownerToken: userPublicToken,
            chatToken: props.chattoken,
            type: 'workoutProgram',
            sentat: new Date()
        }

        props.socket.emit('chat message', { Message: JSON.stringify(DataEncodedInString).toString(), UserPrivateToken: userPrivateToken, ChatToken: props.chattoken, Type: 'workoutProgram' })
        setChatMessages(prevMessages => [...prevMessages, newMessage])

        setCheckoutPoUp(!checkoutPoUp)
    }

    const DeleteMessage = async (id: string) => {
        props.socket.emit('delete message', { MessageId: id, ChatToken: props.chattoken })
        setChatMessages(prevMessages => prevMessages.filter(message => message.id !== id))
    }

    const EditMessage = async (id: string) => {
        props.socket.emit('edit message', { MessageId: id, ChatToken: props.chattoken })
    }

    return (
        <div className="flex h-[90vh] w-full flex-col">
            <div className="m-auto h-[85%] w-[90%] flex-grow-0 self-center overflow-y-scroll">
                {chatMessages
                    .sort((a, b) => new Date(a.sentat).getTime() - new Date(b.sentat).getTime())
                    .map((message: TChatMessage, index: number) => (
                        <ChatMessage
                            id={message.id}
                            key={index}
                            chatToken={message.chatToken}
                            ownerToken={message.ownerToken}
                            message={message.message}
                            sentat={message.sentat}
                            type={message.type}
                            DeleteMessage={() => {
                                DeleteMessage(message.id)
                            }}
                            EditMessage={() => {
                                EditMessage(message.id)
                            }}
                        />
                    ))}
                <div ref={chatEndRef} />
            </div>
            {checkoutPoUp && (
                <PopupCanvas
                    closePopup={() => {
                        setCheckoutPoUp(!checkoutPoUp)
                    }}
                >
                    <div className="flex h-full w-full flex-col">
                        <h1 className="self-center text-2xl text-white">Select Workout</h1>
                        <div className="mt-4 grid h-full w-[95%] gap-4 self-center sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                            {programs.map((program: IWorkoutProgramButton, index: number) => (
                                <WorkoutPlanButton programname={program.programname} programtoken={program.programtoken} sendAttachment={e => SendAttachment(e, program.programtoken, program.programname)} key={index} />
                            ))}
                        </div>
                    </div>
                </PopupCanvas>
            )}

            {props.chattoken != '' && (
                <form className="mb-2 mt-auto flex h-20 w-full" onSubmit={SendMessage}>
                    <div className="m-auto flex h-14 w-[90%] rounded-3xl bg-[#00000080]">
                        <input
                            className="h-full w-full rounded-3xl border-none bg-transparent indent-3 text-white"
                            maxLength={256}
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button
                            className="mr-2 h-full"
                            type="button"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault()
                                setCheckoutPoUp(true)
                            }}
                        >
                            <img src="/assets/Add_Icon.svg" className="m-auto h-[90%] w-[90%]" />
                        </button>
                        <button className="mr-2 h-full" type="submit">
                            <img src="/assets/CommentsIcons/SendComment_icon.svg" className="m-auto h-[90%] w-[90%]" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default ChatArea
