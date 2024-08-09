'use client'
import axios, { AxiosError } from 'axios'
import { getCookie } from 'cookies-next'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

const PlanView = () => {
    const urlParams = useSearchParams()
    const [spreadsheetData, setSpreadsheetData] = useState<any>(null)
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null) // Store the loaded Excel file

    useEffect(() => {
        const loadSpreadsheet = async () => {
            setLoading(true)
            try {
                // Fetch the spreadsheet file
                const response = await axios.get(`${process.env.SERVER_BACKEND}/programs-manager/get-program-data/${getCookie('userToken')}/${urlParams.get('t')}`, {
                    responseType: 'arraybuffer'
                })

                // Store the file data
                const fileData = response.data
                setExcelFile(fileData)

                // Parse the spreadsheet
                const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' })

                // Get all sheet names and set them to state
                const sheetNames = workbook.SheetNames
                setSheetNames(sheetNames)

                // Set the first sheet as the selected sheet initially
                const firstSheetName = sheetNames[0]
                setSelectedSheet(firstSheetName)

                // Convert the first sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName])
                setSpreadsheetData(jsonData)

                setLoading(false)
            } catch (err: any) {
                const decodedString = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(err.response.data)))

                setError(decodedString.errormsg)
                setLoading(false)
            }
        }

        loadSpreadsheet()
    }, [urlParams])

    const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSheet = e.target.value
        setSelectedSheet(selectedSheet)

        // Load data for the selected sheet
        if (excelFile) {
            const workbook = XLSX.read(new Uint8Array(excelFile), { type: 'array' }) // re-read the workbook
            const worksheet = workbook.Sheets[selectedSheet]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            setSpreadsheetData(jsonData)
        }
    }

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
            <div className="p-4">
                <select value={selectedSheet} onChange={handleSheetChange} className="rounded bg-[#474084] px-4 py-2 text-white transition duration-300 hover:bg-[#322e5e]">
                    {sheetNames.map(sheetName => (
                        <option key={sheetName} value={sheetName}>
                            {sheetName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="h-[80vh] flex-grow overflow-y-scroll p-4">
                {spreadsheetData.length > 0 ? (
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <table className="min-w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-200">
                                <tr>
                                    {Object.keys(spreadsheetData[0]).map(key => (
                                        <th key={key} className="border border-gray-300 px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {spreadsheetData.map((row: any, rowIndex: number) => (
                                    <tr key={rowIndex}>
                                        {Object.entries(row).map(([key, value], colIndex) => (
                                            <td key={colIndex} className="border border-gray-300 bg-white p-2 text-sm hover:bg-gray-100">
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
