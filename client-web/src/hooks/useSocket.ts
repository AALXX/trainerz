// useSocket Hook
import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        const socketIo = io(process.env.CHAT_SERVER as string)

        socketIo.on('connect', () => {
            console.log('Socket connected')
        })

        setSocket(socketIo)

        return () => {
            socketIo.disconnect()
        }
    }, [])

    return socket
}

export default useSocket
