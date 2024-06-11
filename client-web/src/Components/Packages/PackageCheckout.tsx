import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { useState } from 'react'

const cardElementOptions = {
    style: {
        base: {
            color: '#ffffff', // Set the text color to white
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4' // Set the placeholder color to a lighter shade
            },
            iconColor: '#ffffff' // Set the icon color to white
        },
        invalid: {
            color: '#fa755a', // Set the text color for invalid fields
            iconColor: '#fa755a'
        }
    }
}

const PackageCheckout = (props: { priceId: string }) => {
    const stripe = useStripe()
    const [email, setEmail] = useState('')
    const [cardholderName, setCardholderName] = useState('')
    const [country, setCountry] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const elements = useElements()

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!stripe || !elements) {
            return
        }

        const cardElement = elements.getElement(CardElement)

        if (cardElement) {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: cardholderName,
                    email: email,
                    address: {
                        country: country
                    }
                }
            })

            if (error) {
                setError(error.message || 'An unexpected error occurred')
            } else {
                try {
                    console.log(paymentMethod)
                    const response = await axios.post(`${process.env.SERVER_BACKEND}/payment-manager/checkout`, {
                        paymentMethodId: paymentMethod.id,
                        UserPrivateToken: getCookie('userToken') as string,
                        priceId: props.priceId
                    })

                    // if (response.data.subscription) {
                    //     setSuccess(true)
                    // } else {
                    //     setError(response.data.message)
                    // }
                } catch (err) {
                    setError('Subscription failed. Please try again.')
                }
            }
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="p-4 bg-[#00000080] shadow-md rounded-xl w-[70%] h-[70%] m-auto">
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white ">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="text-white p-2 block w-full shadow-sm sm:text-sm bg-[#474084] rounded-lg mt-2" required />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white">Cardholder Name</label>
                    <input type="text" value={cardholderName} onChange={e => setCardholderName(e.target.value)} className="text-white mt-2 p-2 block w-full shadow-sm sm:text-sm bg-[#474084] rounded-lg" required />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white">Country</label>
                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="text-white mt-2 p-2 block w-full shadow-sm sm:text-sm bg-[#474084] rounded-lg" required />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white">Card Details</label>
                    <CardElement options={cardElementOptions} className="mt-2 p-4 border border-gray-300 rounded-md mb-4" />
                </div>

                <button type="submit" disabled={!stripe} className="self-center w-full h-12 bg-[#474084] active:bg-[#3b366c] mt-auto justify-center rounded-xl">
                    <h1 className="text-white text-lg">Subscribe</h1>
                </button>
                {error && <div className="text-red-500 mt-4">{error}</div>}
                {success && <div className="text-green-500 mt-4">Subscription Successful!</div>}
            </form>
        </>
    )
}

export default PackageCheckout
