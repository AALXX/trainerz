import { loadStripe } from '@stripe/stripe-js'

let stripePromise: ReturnType<typeof loadStripe>

const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY as string)
    }
    return stripePromise
}

export default getStripe
