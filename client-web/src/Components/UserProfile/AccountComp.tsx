'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { IUserData } from './IAccountProfile'
import { CookieValueTypes, getCookie } from 'cookies-next'
import TrainerTemplate from './TrainerTemplate'
import SportsPersonTemplate from './SportsPersonTemplate'
import { useRouter } from 'next/navigation'

const AccountProfileComp = () => {
    const userToken: string = getCookie('userToken') as string
    const router = useRouter()

    const [userData, setUserData] = useState<IUserData>({
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
            const profileData = await getProfileData(userToken)

            setUserData(profileData.userData)
        })()
    }, [userToken])

    return (
        <div className="flex h-full w-full ">
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
                    userpublictoken={userData.userpublictoken}
                    uservisibility={userData.uservisibility}
                    accountprice={userData.accountprice}
                    rating={userData.rating}
                />
            ) : (
                <SportsPersonTemplate
                // AccountType={userData.AccountType}
                // BirthDate={userData.BirthDate}
                // Description={userData.Description}
                // PhoneNumber={userData.PhoneNumber}
                // LocationCity={userData.LocationCity}
                // LocationCountry={userData.LocationCountry}
                // Sport={userData.Sport}
                // UserEmail={userData.UserEmail}
                // UserName={userData.UserName}
                // UserPublicToken={userData.UserPublicToken}
                // UserVisibility={userData.UserVisibility}
                />
            )}
        </div>
    )
}

export default AccountProfileComp
