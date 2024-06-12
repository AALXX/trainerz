'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/Auth-Security/Auth'
import EditVideoComponent from '@/Components/UserProfile/EditVideoComponent'

const EditVideo = () => {
    const urlParams = useSearchParams() //* t =  search query

    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)
        })()
    }, [])

    return (
        <div className="flex flex-col">
            {userLoggedIn ? (
                <EditVideoComponent videoToken={urlParams.get('vt') as string} />
            ) : (
                <>
                    <h1 className="mt-[2rem] self-center text-white">Not logged In:</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login</h1>
                    </Link>
                </>
            )}
        </div>
    )
}

export default EditVideo
