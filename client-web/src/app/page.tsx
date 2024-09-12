import PackageCardTemplate from '@/Components/Packages/PackageCardTemplate'
import axios from 'axios'
import { getCookie } from 'cookies-next'

interface IRecommendation {
    packagename: string
    packagetoken: string
    packagesport: string
    rating: number
    ownertoken: string
}

const Home = async () => {
    let resultList: Array<IRecommendation> = []

    const res = await axios.get(`${process.env.SERVER_BACKEND}/recomandation-manager/get-home-recommendations/${getCookie('userToken')}`)
    if (res.data.GetFittedPackages !== null) {
        resultList = res.data.GetFittedPackages
    }

    return (
        <>
            {Object.keys(resultList).length === 0 ? (
                <div className="flex h-full flex-col">
                    <h1>SEARCH NOT FOUND</h1>
                </div>
            ) : (
                <div className="flex h-full flex-col overflow-y-scroll">
                    <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                        {resultList.map((result: IRecommendation, index: number) => (
                            <PackageCardTemplate
                                packagesport={result.packagesport}
                                packagetoken={result.packagetoken}
                                key={index}
                                rating={result.rating}
                                packagename={result.packagename}
                                isOwner={false}
                                ownertoken={result.ownertoken}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default Home
