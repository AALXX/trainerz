// components/PhotoSlider.tsx
import React, { useState } from 'react'
import ImageWithAuth from './ImageWithAuth'

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
        <div className="relative mx-auto w-full max-w-2xl self-center">
            <div className="overflow-hidden rounded-lg">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {images.map((image, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                            <ImageWithAuth src={image} alt={`Slide ${index}`} className="w-full object-cover xl:h-[20rem] 3xl:h-[25rem]" />
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-800 p-2 text-white">
                &lt;
            </button>
            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-800 p-2 text-white">
                &gt;
            </button>
        </div>
    )
}

export default PhotoSlider
