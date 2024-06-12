import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { useState } from 'react'
import OptionPicker from '../CommonUi/OptionPicker'

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
                    const response = await axios.post(`${process.env.SERVER_BACKEND}/payment-manager/checkout`, {
                        paymentMethodId: paymentMethod.id,
                        UserPrivateToken: getCookie('userToken') as string,
                        priceId: props.priceId
                    })

                    if (!response.data.error) {
                        setSuccess(true)
                    } else {
                        setError(response.data.errmsg)
                    }
                } catch (err) {
                    setError('Subscription failed. Please try again.')
                }
            }
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="m-auto flex h-[70%] w-[70%] flex-col justify-center rounded-xl bg-[#00000080] p-4 shadow-md">
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white">Cardholder Name</label>
                    <input type="text" value={cardholderName} onChange={e => setCardholderName(e.target.value)} className="mt-2 block w-full rounded-lg bg-[#474084] p-2 text-white shadow-sm sm:text-sm" required />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white">Country</label>
                    <OptionPicker label="Select Country" options={['RO', 'EN']} value={country} onChange={value => setCountry(value)} />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-white">Card Details</label>
                    <CardElement options={cardElementOptions} className="mb-4 mt-2 rounded-md border border-gray-300 p-4" />
                </div>

                <button type="submit" disabled={!stripe} className="mt-auto h-12 w-full justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]">
                    <h1 className="text-lg text-white">Subscribe</h1>
                </button>
                {error && <div className="mt-4 text-red-500">{error}</div>}
                {success && <div className="mt-4 text-green-500">Subscription Successful!</div>}
            </form>
        </>
    )
}

export default PackageCheckout
