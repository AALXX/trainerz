import { cookies } from 'next/headers'
import SubscribedPackages from './SubscribedPackages'
import axios from 'axios'

async function getSubscriptions(userToken: string) {
    const resp = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-subscribed-packages/${userToken}`, {
        headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0'
        }
    })

    if (resp.data.error) {
        throw new Error('Failed to fetch subscriptions')
    }
    return resp.data
}

export default async function Subscriptions() {
    const cookieStore = cookies()
    const userToken = cookieStore.get('userToken')?.value

    if (!userToken) {
        return <div>User token not found. Please log in.</div>
    }

    const { packages } = await getSubscriptions(userToken)

    return (
        <div className="flex h-full flex-col overflow-y-scroll">
            <h1 className="mt-4 self-center text-lg text-white">My Subscriptions</h1>
            <div className="mt-4 grid h-full w-[95%] gap-4 self-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {packages.map((subscription: any, index: number) => (
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
