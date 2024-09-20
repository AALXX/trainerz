import { IUserPrivateData } from '@/Components/UserProfile/IAccountProfile'
import SportsPersonTemplate from '@/Components/UserProfile/SportsPersonTemplate'
import TrainerTemplate from '@/Components/UserProfile/TrainerTemplate'
import { checkAccountStatus } from '@/hooks/useAccountServerSide'
import axios from 'axios'
import { CookieValueTypes } from 'cookies-next'
import Link from 'next/link'
import React from 'react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const Account = async () => {
    const { isLoggedIn, userPrivateToken, userPublicToken } = await checkAccountStatus()

    let userData: IUserPrivateData

    const getProfileData = async (userToken: CookieValueTypes) => {
        const resData = await fetch(`${process.env.SERVER_BACKEND}/user-account-manager/get-account-data/${userToken}`, {
            next: { revalidate: 0 } // This will revalidate the data on every request
        })
        if (resData.ok == false) {
            redirect('/account/login-register')
        }
        return resData.json()
    }

    try {
        const profileData = await getProfileData(userPrivateToken)
        userData = profileData.userData
    } catch (error) {
        console.error('Error fetching profile data:', error)
        redirect('/account/login-register')
    }

    return (
        <div className="flex h-full flex-col overflow-y-scroll">
            {isLoggedIn ? (
                <>
                    {userData.accounttype === 'Trainer' ? (
                        <TrainerTemplate
                            accounttype={userData.accounttype}
                            birthDate={userData.birthDate}
                            description={userData.description}
                            locationlat={userData.locationlat}
                            locationlon={userData.locationlon}
                            sport={userData.sport}
                            phonenumber={userData.phonenumber}
                            useremail={userData.useremail}
                            username={userData.username}
                            userpublictoken={userPublicToken}
                            uservisibility={userData.uservisibility}
                            rating={userData.rating}
                        />
                    ) : (
                        <SportsPersonTemplate
                            accounttype={userData.accounttype}
                            birthDate={userData.birthDate}
                            description={userData.description}
                            locationlat={userData.locationlat}
                            locationlon={userData.locationlon}
                            sport={userData.sport}
                            phonenumber={userData.phonenumber}
                            useremail={userData.useremail}
                            username={userData.username}
                            userpublictoken={userPublicToken}
                            uservisibility={userData.uservisibility}
                        />
                    )}
                </>
            ) : (
                <div className="flex h-full w-full flex-col">
                    <h1 className="mt-[2rem] self-center text-white">Not logged In</h1>
                    <Link className="self-center" href={'/account/login-register'}>
                        <h1 className="text-white">Login!</h1>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Account
