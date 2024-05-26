import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Meta from '@/Meta/Meta'
import NavBar from '@/Components/NavBar/NavBar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <Meta title="Trainerz" description="Trainerz connects athlets with the best trainerz" keywords="fitness gym " />
            <body className={inter.className}>
                <NavBar />
                {children}
            </body>
        </html>
    )
}
