'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCookie } from 'cookies-next'
import ImgWithAuth from '../CommonUi/ImageWithAuth'

const NavBar = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [searchInput, setSearchInput] = useState<string>('')
    const [accountType, setAccountType] = useState<string>('SportsPerson')

    const postSearch = () => {
        window.location.href = `http://localhost:3000/search?q=${searchInput}`
    }

    useEffect(() => {
        // Assuming getCookie is a function that retrieves the value of a cookie by name
        const accountTypeFromCookie = getCookie('accountType') as string
        setAccountType(accountTypeFromCookie )
    }, [])

    return (
        <div className="bg-navbar-grey flex h-[6rem] w-[100%] flex-grow-0 bg-[#00000082]">
            <div className={`fixed left-0 top-0 h-full w-full bg-black transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-50' : 'pointer-events-none opacity-0'}`}></div>
            <div
                onMouseOver={() => {
                    setIsOpen(true)
                }}
                onMouseLeave={() => {
                    setIsOpen(false)
                }}
                className={`bg-navbar-grey fixed left-0 top-0 z-30 flex h-screen w-[15rem] transform flex-col bg-[#0000008e] shadow-lg transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <h1
                    className="mt-10 self-center text-white"
                    onMouseEnter={() => {
                        setIsOpen(true)
                    }}
                    onMouseLeave={() => {
                        setIsOpen(false)
                    }}
                >
                    LOGO
                </h1>
                <Link href={'/'} className="mt-10 h-[2rem] w-[90%] self-center">
                    <button className="h-full w-full rounded-xl border-2 bg-none text-white">HOME</button>
                </Link>

                <Link href={'/account/messages'} className="mt-[1rem] h-[2rem] w-[90%] self-center">
                    <button className="h-full w-full rounded-xl border-2 bg-none text-white">MESSAGES</button>
                </Link>

                {accountType == 'Trainer' && (
                    <>
                        <Link href={'/account/package-creator'} className="mt-[1rem] h-[2rem] w-[90%] self-center">
                            <button className="h-full w-full rounded-xl border-2 bg-none text-white">CREATE PACKAGE</button>
                        </Link>

                        <Link href={'/account/upload'} className="mt-[1rem] h-[2rem] w-[90%] self-center">
                            <button className="h-full w-full rounded-xl border-2 bg-none text-white">UPLOAD VIDEO</button>
                        </Link>

                        <Link href={'/account/plans'} className="mt-[1rem] h-[2rem] w-[90%] self-center">
                            <button className="h-full w-full rounded-xl border-2 bg-none text-white">WORKOUT PLANS</button>
                        </Link>
                    </>
                )}

                <Link href={'/account/my-subscriptions'} className="mt-[1rem] h-[2rem] w-[90%] self-center">
                    <button className="h-full w-full rounded-xl border-2 bg-none text-white">MY SUBSCRIPTION</button>
                </Link>
            </div>

            <h1
                className="z-20 ml-8 cursor-pointer self-center text-white"
                onMouseEnter={() => {
                    setIsOpen(true)
                }}
                onMouseLeave={() => {
                    setIsOpen(false)
                }}
            >
                Trainerz
            </h1>
            <form
                className="ml-[40vw] flex h-full w-[20vw] self-center"
                onSubmit={e => {
                    e.preventDefault()

                    postSearch()
                }}
            >
                <input type="search" className="h-9 w-[75%] self-center rounded-xl border-2 bg-transparent indent-3 text-white" placeholder="Search" onChange={e => setSearchInput(e.currentTarget.value)} />
                {/* <div
                    className="flex bg-[#373737] ml-3 w-10  h-9 self-center cursor-pointer hover:bg-[#444444]"
                    onClick={() => {
                        postSearch()
                    }}
                >
                    <Image className="ml-1 self-center" src="/assets/CommentsIcons/SendComment_icon.svg" width={30} height={30} alt="Send image" />
                </div> */}
            </form>
            <Link className="ml-auto mr-16 self-center" href={'/account'}>
                <ImgWithAuth className="z-10 h-12 w-12 rounded-full" src={`${process.env.FILE_SERVER}/${getCookie('userPublicToken')}/Main_icon.png?cache=none`} alt="Picture of the author" />
            </Link>
        </div>
    )
}

export default NavBar
