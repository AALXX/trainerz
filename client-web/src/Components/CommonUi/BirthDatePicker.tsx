import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface BirthDateSelectorProps {
    onDateChange: (date: Date) => void
}

const BirthDateSelectorComponent: React.FC<BirthDateSelectorProps> = ({ onDateChange }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date)
        if (date) {
            onDateChange(date)
        }
    }

    return (
        <div className="flex flex-col w-full mt-2 ">
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                className=" p-2 border-2 bg-[#474084] text-white border-none w-full rounded-xl shadow-sm  mr-auto   "
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
            />
        </div>
    )
}

export default BirthDateSelectorComponent
