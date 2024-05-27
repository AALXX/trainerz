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
        <div className="flex flex-col items-start mb-4 w-full mt-2 ">
            <div className="relative w-full ">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white ">$</span>
                <input
                    type="number"
                    value={value}
                    onChange={handleChange}
                    placeholder="Enter price"
                    className="block w-full pl-7 pr-4 py-2 text-white rounded-md shadow-sm focus:outline-none bg-[#474084]"
                />
            </div>
        </div>
    )
}

export default PriceInput
