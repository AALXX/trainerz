import { Dispatch, RefObject, SetStateAction } from 'react'

const captureFrame = (videoRef: RefObject<HTMLVideoElement>, canvasRef: RefObject<HTMLCanvasElement>, setCapturedFrame: Dispatch<SetStateAction<string>>, setThumbnalFile: Dispatch<SetStateAction<File | null>>) => {
    // Ensure the video and canvas elements are loaded
    if (!videoRef.current || !canvasRef.current) return

    const maxFrame = videoRef.current.duration // Maximum time in the video
    const randomTime = Math.random() * maxFrame // Generate a random time in the video

    videoRef.current.currentTime = randomTime // Seek to the random time

    videoRef.current.onseeked = () => {
        const context = canvasRef.current!.getContext('2d')
        const scale = 0.21

        // Draw the frame on the canvas
        context?.drawImage(videoRef.current!, 0, 0, videoRef.current!.videoWidth * scale * 1.12, videoRef.current!.videoHeight * scale)
        // Convert the frame to a data URL (base64 image)
        const frameData = canvasRef.current!.toDataURL('image/jpeg')
        // Convert the data URL to a File object
        const thumbnailImage = dataURLtoFile(frameData, 'thumbnail.jpg')
        // Set the captured frame and thumbnail file in the state
        setCapturedFrame(frameData)
        setThumbnalFile(thumbnailImage)
    }
}

const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}

export { captureFrame }
