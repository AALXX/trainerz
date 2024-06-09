// components/PhotoSlider.tsx
import React, { useState } from 'react'

interface PhotoSliderProps {
    images: string[]
}

const PhotoSlider: React.FC<PhotoSliderProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length)
    }

    const prevSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length)
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto self-center">
            <div className="overflow-hidden rounded-lg ">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {images.map((image, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                            <img src={image} alt={`Slide ${index}`} className="w-full object-cover h-[25rem]" />
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={prevSlide} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
                &lt;
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
                &gt;
            </button>
        </div>
    )
}

export default PhotoSlider
