import React from 'react'
import { ITierTemplate } from './IPackages'

const TierTemplate = (props: ITierTemplate) => {
    return (
        <div className="flex h-[70%] p-4">
            <h1 className="text-white text-lg">Price: </h1>
        </div>
    )
}

export default TierTemplate
