'use client'
import React, { Suspense } from 'react'
import SearchResults from '@/Components/Search/SearchResults'

const SearchResultsPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}

export default SearchResultsPage
