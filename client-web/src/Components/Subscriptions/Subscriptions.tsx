import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { useEffect, useState } from 'react'
import SubscribedPackages from './SubscribedPackages'

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    useEffect(() => {
        ;(async () => {
            const resp = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-subscribed-packages/${getCookie('userToken')}`)
            console.log(resp.data)
            setSubscriptions(resp.data.packages)
        })()
    }, [])

    return (
        <div className="flex h-full flex-col overflow-y-scroll">
            <h1 className="mt-4 self-center text-lg text-white">My Subscriptions</h1>
            <div className="mt-4 grid h-full w-[95%] gap-4 self-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {subscriptions.map((subscription: any, index: number) => (
                    <SubscribedPackages
                        key={index}
                        ownertoken={subscription.ownertoken}
                        packagename={subscription.packagename}
                        rating={subscription.rating}
                        packagesport={subscription.packagesport}
                        packagetoken={subscription.packagetoken}
                        tier={subscription.tier}
                    />
                ))}
            </div>
        </div>
    )
}

export default Subscriptions
