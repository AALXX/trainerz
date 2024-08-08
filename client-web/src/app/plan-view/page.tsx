'use client'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

const PlanView = () => {
    const urlParams = useSearchParams()
    const [spreadsheetData, setSpreadsheetData] = useState<any>(null)
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const loadSpreadsheet = async () => {
            // const spreadsheetUrl = urlParams.get('t')
            const spreadsheetUrl =
                'http://192.168.72.81:5600/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTc5NjExNTd9.sWNypbTJ8swm8T4gx1UVzjBr35KmdZ5eeW_E6CfSTnY/Program_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjIxODE4NDR9.ckBFoxJ8AMOdLvHpLPXmZmoCCWY1mkZlH9XkyEn_a3Y/testProgram.xlsx'
            if (spreadsheetUrl) {
                setLoading(true)
                try {
                    // Fetch the spreadsheet file
                    const response = await axios.get(spreadsheetUrl, {
                        responseType: 'arraybuffer',
                        auth: {
                            username: `${process.env.FILE_SERVER_USERNAME}`, // Replace with actual username
                            password: `${process.env.FILE_SERVER_PASSWORD}` // Replace with actual password
                        },
                        withCredentials: true
                    })

                    // Parse the spreadsheet
                    const workbook = XLSX.read(new Uint8Array(response.data), { type: 'array' })

                    // Assume we want to read the first sheet
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]

                    // Convert the worksheet to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)

                    setSpreadsheetData(jsonData)
                    setLoading(false)
                } catch (err) {
                    console.error('Error loading spreadsheet:', err)
                    setError('Failed to load spreadsheet')
                    setLoading(false)
                }
            }
        }

        loadSpreadsheet()
    }, [urlParams])

    if (loading) {
        return <div>Loading Plan...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!spreadsheetData) {
        return <div>No spreadsheet data available</div>
    }

    return (
        <div className="flex h-full flex-col">
            <div className="h-[80vh] flex-grow overflow-y-scroll p-4">
                {spreadsheetData.length > 0 ? (
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {spreadsheetData.map((row: any, rowIndex: number) => (
                                    <tr key={rowIndex}>
                                        {Object.entries(row).map(([key, value], colIndex) => (
                                            <td key={colIndex} className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                <div>{value as React.ReactNode}</div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-white">No Program Found</div>
                )}
            </div>
        </div>
    )
}

const PageView = () => {
    return (
        <div className="flex h-full flex-col">
            <Suspense fallback={<div>Loading spreadsheet content...</div>}>
                <PlanView />
            </Suspense>
        </div>
    )
}

export default PageView
