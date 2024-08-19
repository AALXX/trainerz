'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EditVideoComponent from '@/Components/UserProfile/EditVideoComponent'
import { useAccountStatus } from '@/hooks/useAccount'

const EditVideo = () => {
    const urlParams = useSearchParams() //* t =  search query
    const { isLoggedIn, checkStatus } = useAccountStatus()

    useEffect(() => {
        ;(async () => {
            checkStatus()
        })()
    }, [])

    return (
        <div className="flex h-full flex-col">
            {isLoggedIn ? (
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
