'use client'
import { isLoggedIn } from '@/Auth-Security/Auth'
import EditPackage from '@/Components/Packages/EditPackage'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const EditPackagePage = () => {
    const urlParams = useSearchParams() //* t =  search query

    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)
        })()
    }, [])

    return (
        <div className="flex flex-col h-full">
            {userLoggedIn ? (
                <EditPackage packageToken={urlParams.get('t') as string} />
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

export default EditPackagePage
