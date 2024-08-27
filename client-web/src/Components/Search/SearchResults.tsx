import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { ISearchProps } from './ISearch'
import AccountProfileCardTemplate from './AccountProfileCard'
import PackageCardTemplate from '../Packages/PackageCardTemplate'

const SearchResults = () => {
    const urlParams = useSearchParams() //* q =  search query
    const [resultList, setResultlist] = useState<Array<ISearchProps>>([])

    useEffect(() => {
        ;(async () => {
            if ((urlParams.get('q') as string) == '') {
            } else {
                const res = await axios.get(`${process.env.SEARCH_SERVER}/search/${urlParams.get('q') as string}`)
                if (res.data.results !== null) {
                    setResultlist(res.data.results)
                }
            }
        })()
    }, [])

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
