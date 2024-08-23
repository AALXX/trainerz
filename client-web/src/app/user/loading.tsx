import LoadingScreen from '@/Components/CommonUi/LoadingScreen'
import React from 'react'

/**
 * loading page
 * @return {JSX}
 */
export default function LoadingPage() {
    return (
        <div className="flex h-full flex-col">
            <LoadingScreen />
        </div>
    )
}
