'use client'
import { isLoggedIn } from '@/Auth-Security/Auth'
import UploadComopnent from '@/Components/UserProfile/util/UploadComopnent'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import React from 'react'

const UploadPage = () => {
    const [userLoggedIn, setUserLoggedIn] = useState(false)

    useEffect(() => {
        const loginAync = async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)
        }
        loginAync()
    }, [])

    return (
        <>
            {userLoggedIn ? (
                <UploadComopnent />
            ) : (
                <div className="flex w-full flex-col">
                    <h1 className="mt-[2rem] self-center text-white">Not logged In</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login!</h1>
                    </Link>
                </div>
            )}
        </>
    )
}

export default UploadPage
