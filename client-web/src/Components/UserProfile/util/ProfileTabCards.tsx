import React, { Dispatch, SetStateAction } from 'react'

interface ISelectableCardsProps {
    Title: string
    TabName: string
    setComponentToShow: Dispatch<SetStateAction<string>>
    className: string
    activeTab: string
    onClick?: () => void
}

const SelectableCards = (props: ISelectableCardsProps) => {
    const { Title, TabName, setComponentToShow, className, activeTab } = props

    const isActive = activeTab === TabName
    const activeClass = isActive ? 'bg-[#524c8b]' : 'bg-[#0000003d]'

    return (
        <div
            className={`flex flex-col ${className} ${activeClass}`}
            onClick={() => {
                props.onClick && props.onClick()
                setComponentToShow(TabName)
            }}
        >
            <h1 className="self-center text-xl text-white ">{Title}</h1>
        </div>
    )
}

export default SelectableCards
