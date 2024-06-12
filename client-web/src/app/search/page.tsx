'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'

const SearchResults = () => {
    const urlParams = useSearchParams() //* q =  search query
    const [usersList, setUsersList] = useState<Array<any>>([])

    useEffect(() => {
        ;(async () => {
            if ((urlParams.get('q') as string) == '') {
            } else {
                const res = await axios.get(`${process.env.SEARCH_SERVER}/search/${urlParams.get('q') as string}`)
                console.log(res.data)
            }
        })()
    }, [])

    return (
        <>
            {Object.keys(usersList).length === 0 ? (
                <div className="flex h-full flex-col">
                    <h1>SEARCH NOT FOUND</h1>
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* {usersList.map((video: IVideoTemplateProps, index: number) => (
                          
                        ))} */}
                </div>
            )}
        </>
    )
}

export default SearchResults
