import React, { useState } from 'react'

interface PriceInputProps {
    value: number
    onChange: (value: number) => void
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange }) => {
    const handleChange = (e: any) => {
        onChange(e.target.value)
    }

    return (
        <div className="mb-4 mt-2 flex w-full flex-col items-start">
            <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">$</span>
                <input type="number" value={value} onChange={handleChange} placeholder="Enter price" className="block w-full rounded-md bg-[#474084] py-2 pl-7 pr-4 text-white shadow-sm focus:outline-none" />
            </div>
        </div>
    )
}

export default PriceInput
