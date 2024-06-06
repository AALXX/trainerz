import React, { Dispatch, SetStateAction } from 'react'

interface ISelectableCardsProps {
    Title: string
    TabName: string
    setComponentToShow: Dispatch<SetStateAction<string>>
    className?: string // Add className as an optional prop
}

const SelectableCards = (props: ISelectableCardsProps) => {
    const { Title, TabName, setComponentToShow, className } = props

    return (
        <div
            className={`flex flex-col ${className}`}
            onClick={() => {
                setComponentToShow(TabName)
            }}
        >
            <h1 className="text-white self-center text-xl">{Title}</h1>
        </div>
    )
}

export default SelectableCards
