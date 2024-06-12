import React, { Dispatch, SetStateAction } from 'react'

interface ISelectableCardsProps {
    Title: string
    TabName: string
    setComponentToShow: Dispatch<SetStateAction<string>>
    className: string
    onClick?: () => void
}

const SelectableCards = (props: ISelectableCardsProps) => {
    const { Title, TabName, setComponentToShow, className } = props

    return (
        <div
            className={`flex flex-col ${className}`}
            onClick={() => {
                props.onClick && props.onClick()
                setComponentToShow(TabName)
            }}
        >
            <h1 className="self-center text-xl text-white">{Title}</h1>
        </div>
    )
}

export default SelectableCards
