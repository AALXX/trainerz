'use client'
import EditPackage from '@/Components/Packages/EditPackage'
import { useAccountStatus } from '@/hooks/useAccount'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const EditPackagePage = () => {
    const urlParams = useSearchParams() //* t =  search query

    const { isLoggedIn, checkStatus } = useAccountStatus()

    useEffect(() => {
        ;(async () => {
            await checkStatus()
        })()
    }, [])

    return (
        <div className="flex h-full flex-col">
            {isLoggedIn ? (
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
