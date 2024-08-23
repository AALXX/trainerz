import React from 'react'
import axios from 'axios'
import { ISearchProps } from '@/Components/Search/ISearch'
import AccountProfileCardTemplate from '@/Components/Search/AccountProfileCard'
import PackageCardTemplate from '@/Components/Packages/PackageCardTemplate'

const SearchResults = async ({ params }: { params: { search: string } }) => {
    let resultList: Array<ISearchProps> = []

    const res = await axios.get(`${process.env.SEARCH_SERVER}/search/${params.search}`)
    if (res.data.results !== null) {
        resultList = res.data.results
    }

    return (
        <>
            {Object.keys(resultList).length === 0 ? (
                <div className="flex h-full flex-col">
                    <h1>SEARCH NOT FOUND</h1>
                </div>
            ) : (
                <div className="flex h-full flex-col">
                    <div className="mt-4 grid h-full w-[95%] gap-4 self-center overflow-y-scroll sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {resultList.map((result: ISearchProps, index: number) => (
                            <>
                                {result.Type === 'user' ? (
                                    <AccountProfileCardTemplate
                                        AccountDescription={result.AccountDescription}
                                        UserName={result.UserName}
                                        UserPublicToken={result.UserPublicToken}
                                        Rating={result.Rating}
                                        Sport={result.Sport}
                                    />
                                ) : (
                                    <PackageCardTemplate
                                        packagesport={result.Sport}
                                        packagetoken={result.PackageToken}
                                        key={index}
                                        rating={result.Rating}
                                        packagename={result.PackageName}
                                        isOwner={false}
                                        ownertoken={result.OwnerToken}
                                    />
                                )}
                            </>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default SearchResults
