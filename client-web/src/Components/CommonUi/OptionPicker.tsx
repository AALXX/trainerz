import React from 'react'

interface OptionPickerProps {
    label: string
    options: string[]
    value: string
    onChange: (value: string) => void
}

const OptionPicker: React.FC<OptionPickerProps> = ({ label, options, value, onChange }) => {
    return (
        <div className="flex flex-col items-start mb-4">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="block w-full px-4 py-2 text-white bg-[#474084]   rounded-xl shadow-sm focus:outline-none mt-2"
            >
                <option value="">Select {label}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default OptionPicker
