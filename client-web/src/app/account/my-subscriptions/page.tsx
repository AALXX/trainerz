'use client'
import Subscriptions from '@/Components/Subscriptions/Subscriptions'
import { useAccountStatus } from '@/hooks/useAccount'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import React from 'react'

const MySubscripoions = () => {
    const { isLoggedIn, checkStatus } = useAccountStatus()

    useEffect(() => {
        (async () => {
            await checkStatus()

        })()
    }, [])

    return (
        <>
            {isLoggedIn ? (
                <Subscriptions />
            ) : (
                <div className="flex h-full w-full flex-col">
                    <h1 className="mt-[2rem] self-center text-white">Not logged In</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login!</h1>
                    </Link>
                </div>
            )}
        </>
    )
}

export default MySubscripoions
