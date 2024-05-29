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
                <div>
                    <h1>Account Not Found</h1>
                    <Link href={'/account/login-register'}>
                        <h1>Go TO LOGIN</h1>
                    </Link>
                </div>
            )}
        </>
    )
}

export default UploadPage
