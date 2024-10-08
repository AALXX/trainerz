'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getCookie } from 'cookies-next'

import { IUserPublicData, IVideoTemplate } from '@/Components/UserProfile/IAccountProfile'
import SportsPersonTemplate from '@/Components/UserProfile/SportsPersonTemplate'
import TrainerTemplate from '@/Components/UserProfile/TrainerTemplate'

/**
 * watch video page
 * @return {JSX}
 */
export default function CreatorAccountPage() {
    const urlParams = useSearchParams()
    const [userData, setUserData] = useState<IUserPublicData>({
        username: '',
        description: '',
        sport: '',
        useremail: '',
        phonenumber: '',
        uservisibility: '',
        accounttype: '',
        userpublictoken: '',
        rating: 0,
    })
    const [userFound, setUserFound] = useState<boolean>(false)
    const [userFollwsAccount, setUserFollwsAccount] = useState<boolean>(false)
    const [videosData, setVideosData] = useState<Array<IVideoTemplate>>([])

    useEffect(() => {
        ;(async () => {
            const res = await axios.get(`${process.env.SERVER_BACKEND}/user-account-manager/get-creator-data/${urlParams.get('id')}/${getCookie('userPublicToken')}`)
            setUserData(res.data.userData)
            setUserFollwsAccount(res.data.userFollowsCreator)
            console.log(res.data.userData)
            if (res.data.userData == null) {
                setUserFound(false)
            } else {
                setUserFound(true)
            }
        })()
    }, [])

    return (
        <div className="flex h-full flex-col overflow-y-scroll">

            {userFound ? (
                <>
                    {userData.accounttype === 'Trainer' ? (
                        <TrainerTemplate
                            accounttype={userData.accounttype}
                            birthDate={new Date()}
                            description={userData.description}
                            locationlat=""
                            locationlon=""
                            sport={userData.sport}
                            phonenumber={userData.phonenumber}
                            useremail={userData.useremail}
                            username={userData.username}
                            userpublictoken={urlParams.get('id') as string}
                            uservisibility={userData.uservisibility}
                            rating={userData.rating}
                        />
                    ) : (
                        <SportsPersonTemplate
                            accounttype={userData.accounttype}
                            birthDate={new Date()}
                            description={userData.description}
                            locationlat=""
                            locationlon=""
                            sport={userData.sport}
                            phonenumber={userData.phonenumber}
                            useremail={userData.useremail}
                            username={userData.username}
                            userpublictoken={urlParams.get('id') as string}
                            uservisibility={userData.uservisibility}
                        />
                    )}
                </>
            ) : (
                <div className="flex flex-col">
                    <h1 className="mt-[2rem] self-center text-white">User Not Found</h1>
                </div>
            )}
        </div>
    )
}
