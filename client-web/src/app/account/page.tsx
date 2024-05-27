import { isLoggedIn } from '@/Auth-Security/Auth'
import AccountProfileComp from '@/Components/UserProfile/AccountComp'
import Link from 'next/link'
import React, { useState } from 'react'

const Account = async () => {
    return (
        <div className="flex  flex-col ">
            {(await isLoggedIn()) ? (
                <AccountProfileComp />
            ) : (
                <div className='flex w-full flex-col'>
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
