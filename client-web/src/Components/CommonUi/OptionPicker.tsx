import React from 'react'

interface OptionPickerProps {
    label: string
    options: string[]
    value: string
    onChange: (value: string) => void
}

const OptionPicker: React.FC<OptionPickerProps> = ({ label, options, value, onChange }) => {
    return (
        <div className="mb-4 flex flex-col items-start ">
            <select value={value} onChange={e => onChange(e.target.value)} className="mt-2 block w-full h-full  rounded-xl bg-[#474084] px-4 py-2 text-white shadow-sm focus:outline-none">
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
