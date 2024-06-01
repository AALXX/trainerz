'use client'

import { isLoggedIn } from '@/Auth-Security/Auth'
import { IUserPrivateData } from '@/Components/UserProfile/IAccountProfile'
import SportsPersonTemplate from '@/Components/UserProfile/SportsPersonTemplate'
import TrainerTemplate from '@/Components/UserProfile/TrainerTemplate'
import axios from 'axios'
import { CookieValueTypes, getCookie } from 'cookies-next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Account = () => {
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)

    const userToken: string = getCookie('userToken') as string
    const router = useRouter()

    const [userData, setUserData] = useState<IUserPrivateData>({
        username: '',
        description: '',
        birthDate: new Date(),
        locationlon: '',
        locationlat: '',
        sport: '',
        useremail: '',
        phonenumber: '',
        uservisibility: '',
        accounttype: '',
        userpublictoken: '',
        rating: 0,
        accountprice: 0,
        accountfolowers: 0
    })

    const getProfileData = async (userToken: CookieValueTypes) => {
        const resData = await axios.get(`${process.env.SERVER_BACKEND}/user-account-manager/get-account-data/${userToken}`)
        if (resData.data.error == true) {
            router.push('/account/login-register')
            return console.error('ERROR GET PROFILE DATA FAILED')
        }
        return resData.data
    }

    useEffect(() => {
        /**
         * Get user profile Data
         */
        ;(async () => {
            const usrLoggedIn = await isLoggedIn()
            setUserLoggedIn(usrLoggedIn)

            const profileData = await getProfileData(userToken)
            setUserData(profileData.userData)
        })()
    }, [userToken])

    return (
        <div className="flex  flex-col h-full">
            {userLoggedIn ? (
                <>
                    {userData.accounttype === 'Trainer' ? (
                        <TrainerTemplate
                            accountfolowers={userData.accountfolowers}
                            accounttype={userData.accounttype}
                            birthDate={userData.birthDate}
                            description={userData.description}
                            locationlat={userData.locationlat}
                            locationlon={userData.locationlon}
                            sport={userData.sport}
                            phonenumber={userData.phonenumber}
                            useremail={userData.useremail}
                            username={userData.username}
                            userpublictoken={getCookie('userPublicToken') as string}
                            uservisibility={userData.uservisibility}
                            accountprice={userData.accountprice}
                            rating={userData.rating}
                        />
                    ) : (
                        <SportsPersonTemplate
                            accountfolowers={0}
                            accounttype={userData.accounttype}
                            birthDate={userData.birthDate}
                            description={userData.description}
                            locationlat={userData.locationlat}
                            locationlon={userData.locationlon}
                            sport={userData.sport}
                            phonenumber={userData.phonenumber}
                            useremail={userData.useremail}
                            username={userData.username}
                            userpublictoken={getCookie('userPublicToken') as string}
                            uservisibility={userData.uservisibility}
                        />
                    )}
                </>
            ) : (
                <div className="flex w-full flex-col h-full">
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
