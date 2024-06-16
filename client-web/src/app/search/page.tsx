'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { ISearchResults } from '@/Components/SearchSystem/ISearchSystem'
import PackageCard from '@/Components/SearchSystem/PackageCard'
import AccountProfileCard from '@/Components/SearchSystem/AccountProfileCard'

const SearchResults = () => {
    const urlParams = useSearchParams() //* q =  search query
    const [resultsList, setResultsList] = useState<Array<ISearchResults>>([])

    useEffect(() => {
        ;(async () => {
            if ((urlParams.get('q') as string) == '') {
            } else {
                const res = await axios.get(`${process.env.SEARCH_SERVER}/search/${urlParams.get('q') as string}`)
                console.log(res.data)
                setResultsList(res.data.results)
            }
        })()
    }, [])

    return (
        <div className="flex h-full w-full flex-col overflow-y-scroll">
            {Object.keys(resultsList).length === 0 ? (
                <div className="flex h-full flex-col">
                    <h1>SEARCH NOT FOUND</h1>
                </div>
            ) : (
                <div className="mt-4 grid h-full w-[95%] gap-4 self-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {resultsList.map((result: ISearchResults, index: number) => (
                        <>
                            {result.Type === 'package' ? (
                                <PackageCard OwnerToken={result.OwnerToken} PackageToken={result.PackageToken} PackageName={result.PackageName} PackageSport={result.PackageSport} Rating={result.Rating} key={index} />
                            ) : (
                                <AccountProfileCard key={index} AccountType={result.AccountType} Rating={result.Rating} UserName={result.UserName} UserPublicToken={result.UserPublicToken} Sport={result.Sport} AccountDescription={result.AccountDescription} />
                            )}
                        </>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchResults
