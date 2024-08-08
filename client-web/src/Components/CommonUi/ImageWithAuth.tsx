import React, { useEffect, useRef } from 'react'

interface IImgWithAuth extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
}

const ImgWithAuth: React.FC<IImgWithAuth> = ({ src, alt, className, ...otherProps }) => {
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(src, {
                    headers: {
                        Authorization: 'Basic ' + btoa(`${process.env.FILE_SERVER_USERNAME}:${process.env.FILE_SERVER_PASSWORD}`)
                    }
                })
                if (response.ok) {
                    const blob = await response.blob()
                    const objectUrl = URL.createObjectURL(blob)
                    if (imgRef.current) {
                        imgRef.current.src = objectUrl
                    }
                } else {
                    console.error('Failed to fetch image:', response.status)
                }
            } catch (error) {
                console.error('Error fetching image:', error)
            }
        }

        fetchImage()
    }, [src])

    return <img ref={imgRef} src={src} alt={alt} className={className} {...otherProps} />
}

export default ImgWithAuth
