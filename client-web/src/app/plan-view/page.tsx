'use client'
import LoadingScreen from '@/Components/CommonUi/LoadingScreen'
import axios, { AxiosError } from 'axios'
import { getCookie } from 'cookies-next'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

interface WorkbookType {
    Sheets: {
        [key: string]: XLSX.WorkSheet
    }
    SheetNames: string[]
}

interface ExcelDataType {
    [key: string]: string | number
}

const PlanView = () => {
    const urlParams = useSearchParams()

    const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null)
    const [workbook, setWorkbook] = useState<WorkbookType | null>(null)
    const [excelData, setExcelData] = useState<ExcelDataType[]>([])

    const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [sheetIndex, setSheetIndex] = useState<number>(0)
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [uploadStatus, setUploadStatus] = useState<string>('')
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const loadSpreadsheet = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`${process.env.SERVER_BACKEND}/programs-manager/get-program-data/${getCookie('userToken')}/${urlParams.get('t')}`, {
                    responseType: 'arraybuffer'
                })

                const fileData = response.data
                setExcelFile(fileData)

                const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' })
                setWorkbook(workbook)

                const sheetNames = workbook.SheetNames
                setSheetNames(sheetNames)

                setSheetIndex(0)
                setExcelData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { defval: '' }))

                setLoading(false)
            } catch (err: any) {
                console.error('Error loading spreadsheet:', err)
                setLoading(false)
            }
        }

        loadSpreadsheet()
    }, [urlParams])

    const handleSheetChange = useCallback(
        async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const index = parseInt(e.target.value)

            setSheetIndex(index)

            if (workbook) {
                setLoading(true)
                setExcelData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[index]], { defval: '' }))
                setLoading(false)
                setUnsavedChanges(false)
            }
        },
        [workbook, sheetNames, unsavedChanges]
    )

    const renderTableHeaders = useMemo(() => {
        return excelData.length > 0 ? (
            <thead className="sticky top-0 z-10 bg-gray-200">
                <tr>
                    {Object.keys(excelData[0]).map(key => (
                        <th key={key} className="border border-gray-300 px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                            {key}
                        </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Actions</th>
                </tr>
            </thead>
        ) : null
    }, [excelData])

    const renderTableBody = useMemo(() => {
        return excelData.length > 0 ? (
            <tbody>
                {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {Object.entries(row).map(([key, value], colIndex) => (
                            <td key={colIndex} className={`hover:bg-gray-100'} border border-gray-300 bg-white p-2 text-sm`}>
                                <div>{value as React.ReactNode}</div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        ) : null
    }, [excelData, editCell, editValue])

    return (
        <div className="flex flex-col">
            {loading ? <LoadingScreen /> : null}
            <div className="p-4">
                <form className="flex items-center space-x-4">
                    {excelData.length > 0 && (
                        <>
                            <select value={sheetIndex} onChange={handleSheetChange} className="rounded bg-[#474084] px-4 py-2 text-white transition duration-300 hover:bg-[#322e5e]">
                                {sheetNames.map((sheetName, index) => (
                                    <option key={index} value={index}>
                                        {sheetName}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </form>
            </div>

            <div className="h-[80vh] flex-grow overflow-y-scroll p-4">
                {excelData.length > 0 ? (
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <table className="min-w-full border-collapse">
                            {renderTableHeaders}
                            {renderTableBody}
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-white">No file uploaded</div>
                )}
            </div>
        </div>
    )
}

export default PlanView
