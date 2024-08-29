import React, { useState } from 'react'

interface StarRatingProps {
    count?: number
    value?: number
    onChange?: (value: number) => void
}

const StarRating: React.FC<StarRatingProps> = ({ count = 5, value = 0, onChange }) => {
    const [hover, setHover] = useState<number>(0)

    const handleClick = (index: number) => {
        if (onChange) {
            onChange(index)
        }
    }

    const handleMouseOver = (index: number) => {
        setHover(index)
    }

    const handleMouseLeave = () => {
        setHover(0)
    }

    return (
        <div className="flex w-32 self-center mr-4">
            {Array.from({ length: count }, (_, index) => {
                const starValue = index + 1
                return (
                    <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className={`h-6 w-6 cursor-pointer ${starValue <= (hover || value) ? 'text-yellow-500' : 'text-gray-300'}`}
                        onClick={() => handleClick(starValue)}
                        onMouseOver={() => handleMouseOver(starValue)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <path d="M12 2c-.38 0-.74.22-.9.58L8.7 9H2.82c-.41 0-.79.25-.93.64-.14.39 0 .83.35 1.06l5.07 3.58-1.95 7.15c-.11.42.03.88.36 1.14.33.26.79.28 1.14.05L12 18.59l5.14 3.74c.34.25.8.21 1.14-.05.33-.26.47-.72.36-1.14l-1.95-7.15 5.07-3.58c.35-.24.49-.67.35-1.06-.14-.39-.52-.64-.93-.64h-5.88l-2.4-6.42A1 1 0 0012 2z" />
                    </svg>
                )
            })}
        </div>
    )
}

export default StarRating
