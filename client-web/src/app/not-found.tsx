import Link from 'next/link'
import { headers } from 'next/headers'

export default async function NotFound() {
    const headersList = headers()
    const domain = headersList.get('host')
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <p>Could not find requested resource</p>
            <Link href="/">
                <h1>Return to Home page</h1>
            </Link>
        </div>
    )
}
