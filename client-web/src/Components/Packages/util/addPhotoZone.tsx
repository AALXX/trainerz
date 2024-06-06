import React, { useState } from 'react'

interface IAddPhotoZoneProps {
    setImageFile: (file: File | null) => void
}

const AddPhotoZone: React.FC<IAddPhotoZoneProps> = ({ setImageFile }) => {
    const [image, setImage] = useState<string | null>(null)

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
        <div className="relative flex 3xl:w-[14rem] 3xl:h-[8rem] xl:w-[10rem] xl:h-[6rem] lg:w-[8rem] lg:h-[5rem] border-2 cursor-pointer">
            {image ? (
                <>
                    <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer text-white">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            Change Photo
                        </label>
                    </div>
                </>
            ) : (
                <label className="flex items-center justify-center w-full h-full cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <img src="/assets/PackagesIcons/addPhoto_Icon.svg" alt="AccountImageButton" className="m-auto w-[7rem] h-[2rem]" />
                </label>
            )}
        </div>
    )
}

export default AddPhotoZone
