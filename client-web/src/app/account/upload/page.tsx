'use client'
import UploadComopnent from '@/Components/UserProfile/UploadComopnent'
import { useAccountStatus } from '@/hooks/useAccount'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import React from 'react'

const UploadPage = () => {
    const { isLoggedIn, checkStatus } = useAccountStatus()

    useEffect(() => {
        const loginAync = async () => {
            await checkStatus()
        }
        loginAync()
    }, [])

    return (
        <>
            {isLoggedIn ? (
                <UploadComopnent />
            ) : (
                <div className="flex w-full h-full flex-col">
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
