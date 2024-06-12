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
        <div className="mt-2 flex w-full flex-col">
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                className="mr-auto w-full rounded-xl border-2 border-none bg-[#474084] p-2 text-white shadow-sm"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
            />
        </div>
    )
}

export default BirthDateSelectorComponent
