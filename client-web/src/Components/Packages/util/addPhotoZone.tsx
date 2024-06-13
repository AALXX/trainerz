import React, { useState, useEffect } from 'react'

interface IAddPhotoZoneProps {
    setImageFile: (file: File | null) => void
    imageUrl?: string
}

const AddPhotoZone: React.FC<IAddPhotoZoneProps> = ({ imageUrl, setImageFile }) => {
    const [image, setImage] = useState<string | null>(null)

    useEffect(() => {
        if (imageUrl) {
            setImage(imageUrl)
        }
    }, [imageUrl])

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
            }
            reader.readAsDataURL(file)
            setImageFile(file)
        } else {
            setImage(null)
            setImageFile(null)
        }
    }

    return (
        <div className="relative flex cursor-pointer border-2 lg:h-[5rem] lg:w-[8rem] xl:h-[6rem] xl:w-[10rem] 3xl:h-[8rem] 3xl:w-[14rem]">
            {image ? (
                <>
                    <img src={image} alt="Uploaded" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                        <label className="cursor-pointer text-white">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            Change Photo
                        </label>
                    </div>
                </>
            ) : (
                <label className="flex h-full w-full cursor-pointer items-center justify-center">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <img src="/assets/PackagesIcons/addPhoto_Icon.svg" alt="AccountImageButton" className="m-auto h-[2rem] w-[7rem]" />
                </label>
            )}
        </div>
    )
}

export default AddPhotoZone
