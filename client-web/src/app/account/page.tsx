'use client'

import { isLoggedIn } from '@/Auth-Security/Auth'
import AccountProfileComp from '@/Components/UserProfile/AccountComp'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Account = () => {
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)

    useEffect(() => {
        const loginAync = async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)
        }
        loginAync()
    }, [])

    return (
        <div className="flex  flex-col ">
            {userLoggedIn ? (
                <AccountProfileComp />
            ) : (
                <div className="flex w-full flex-col">
                    <h1 className="text-white self-center mt-[2rem]">Not logged In</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login!</h1>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Account
