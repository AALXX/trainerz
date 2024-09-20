'use client'
import React, { useEffect, useState } from 'react'
import StarRating from './util/StarRating'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import { IReviews } from './IReviews'

const PackageReview = (props: { packageToken: string; isLoggedIn: boolean }) => {
    const [rating, setRating] = React.useState<number>(0)
    const [reviewText, setReviewText] = useState<string>('')
    const [reviews, setReviews] = useState<IReviews[]>([])

    const postRating = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const resp = await axios.post(`${process.env.SERVER_BACKEND}/package-manager/post-review`, {
            userPrivateToken: getCookie('userToken') as string,
            packageToken: props.packageToken,
            rating: rating,
            reviewText: reviewText
        })
        setReviewText('') // Clear the input after submission
        setRating(0) // Reset the rating after submission
        // Fetch updated reviews
        const updatedReviews = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-package-reviews/${props.packageToken}`)
        setReviews(updatedReviews.data.reviews)
    }

    useEffect(() => {
        ;(async () => {
            const resp = await axios.get(`${process.env.SERVER_BACKEND}/package-manager/get-package-reviews/${props.packageToken}`)
            setReviews(resp.data.reviews)
        })()
    }, [props.packageToken])

    return (
        <div className="flex h-full w-full flex-col ">
            {props.isLoggedIn ? (
                <form className="flex w-full bg-[#00000071]" onSubmit={postRating}>
                    <input className="h-10 w-full bg-transparent p-4 text-white placeholder:text-white" placeholder="Write a review..." onChange={e => setReviewText(e.target.value)} value={reviewText} />
                    <StarRating value={rating} onChange={setRating} />
                    <button className="mr-4 h-10 w-20 bg-transparent text-white" type="submit">
                        Submit
                    </button>
                </form>
            ) : null}

            <div className="flex h-full flex-col overflow-y-scroll ">
                {reviews.map((review, index) => (
                    <div key={index} className="mt-2 flex flex-col border-b border-gray-600 p-4">
                        <div className="flex w-full">
                            <h1 className="text-lg text-white">{review.username}</h1>
                            <h1 className="ml-auto self-center text-lg text-white">{review.reviewrating}/5</h1>
                            <img className="h-10 w-10 self-center" src={`/assets/AccountIcons/Star_Icon.svg`} alt="Profile Picture" />
                        </div>
                        <h1 className="text-base text-gray-300">{review.reviewtext}</h1>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PackageReview
