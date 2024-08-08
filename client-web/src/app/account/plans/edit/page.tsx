'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import LoadingScreen from '@/Components/CommonUi/LoadingScreen'

const EditWorkoutPlan = () => {
    const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null)
    const [typeError, setTypeError] = useState<boolean>(false)
    const [excelData, setExcelData] = useState<any[]>([])
    const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [sheetIndex, setSheetIndex] = useState<number>(0)
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [programName, setProgramName] = useState<string>('')
    const [uploadStatus, setUploadStatus] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        if (e.target.files && e.target.files.length > 0 && fileTypes.includes(e.target.files[0].type)) {
            const reader = new FileReader()
            setLoading(true)

            reader.onload = () => {
                const fileData = reader.result as ArrayBuffer
                setExcelFile(fileData)
                const workbook = XLSX.read(fileData, { type: 'array' })
                setSheetNames(workbook.SheetNames)
                setSheetIndex(0)
                setExcelData(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]))
            }
            reader.readAsArrayBuffer(e.target.files[0])
            setTypeError(false)
            setLoading(false)
        } else {
            setTypeError(true)
        }
    }, [])

    const handleSheetChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const index = parseInt(e.target.value)
            setSheetIndex(index)
            if (excelFile) {
                setLoading(true) // Start loading
                const workbook = XLSX.read(excelFile, { type: 'array' })
                setExcelData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[index]]))
                setLoading(false) // End loading
            }
        },
        [excelFile, sheetNames]
    )

    const handleCellEdit = useCallback((row: number, col: string, value: any) => {
        setEditCell({ row, col })
        setEditValue(value.toString())
    }, [])

    const handleSaveEdit = useCallback(() => {
        if (editCell) {
            setExcelData(prevData => {
                const newData = [...prevData]
                newData[editCell.row][editCell.col] = editValue
                return newData
            })
            setEditCell(null)
        }
    }, [editCell, editValue])

    const handleSaveChanges = useCallback(() => {
        if (excelData.length > 0) {
            const workbook = XLSX.utils.book_new()
            const worksheet = XLSX.utils.json_to_sheet(excelData)
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
            XLSX.writeFile(workbook, 'edited_excel_file.xlsx')
        }
    }, [excelData])

    const handleUploadToServer = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            if (!excelFile || !programName) {
                setUploadStatus('Please load a file and enter a program name before uploading.')
                return
            }

            try {
                setUploadStatus('Uploading...')

                // Read the original workbook
                const originalWorkbook = XLSX.read(excelFile, { type: 'array' })

                // Create a new workbook to be uploaded
                const newWorkbook = XLSX.utils.book_new()

                // Append all sheets from the original workbook to the new workbook
                originalWorkbook.SheetNames.forEach(sheetName => {
                    const worksheet = originalWorkbook.Sheets[sheetName]
                    XLSX.utils.book_append_sheet(newWorkbook, worksheet, sheetName)
                })

                // Convert the new workbook to a buffer
                const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' })

                // Create a Blob from the buffer
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

                // Prepare FormData for the upload
                const formData = new FormData()
                formData.append('workoutProgram', blob, `${programName}.xlsx`)
                formData.append('ProgramName', programName)
                formData.append('UserPrivateToken', getCookie('userToken') as string)

                // Upload the file to the server
                const response = await axios.post(`${process.env.SERVER_BACKEND}/programs-manager/upload-program`, formData)
                setUploadStatus(response.data.error === false ? 'Upload successful!' : 'Upload failed. Please try again.')
            } catch (error) {
                console.error('Error uploading file:', error)
                setUploadStatus('Upload failed due to an error. Please try again.')
            }
        },
        [excelFile, programName]
    )

    const renderTableHeaders = useMemo(() => {
        return excelData.length > 0 ? (
            <thead className="bg-gray-50">
                <tr>
                    {Object.keys(excelData[0]).map(key => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            {key}
                        </th>
                    ))}
                </tr>
            </thead>
        ) : null
    }, [excelData])

    const renderTableBody = useMemo(() => {
        return excelData.length > 0 ? (
            <tbody className="divide-y divide-gray-200 bg-white">
                {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {Object.entries(row).map(([key, value], colIndex) => (
                            <td key={colIndex} className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {editCell?.row === rowIndex && editCell?.col === key ? (
                                    <input value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveEdit} autoFocus className="w-full border-b border-blue-500 focus:outline-none" />
                                ) : (
                                    <div onClick={() => handleCellEdit(rowIndex, key, value)}>{value as React.ReactNode}</div>
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        ) : null
    }, [excelData, editCell, editValue, handleCellEdit, handleSaveEdit])

    return (
        <div className="flex h-screen flex-col">
            {loading ? <LoadingScreen /> : null}
            <div className="p-4">
                <form className="flex items-center space-x-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                    />
                    <button onClick={handleSaveChanges} className="rounded bg-[#3a356b] px-4 py-2 text-white transition duration-300 hover:bg-[#322e5e]">
                        Load
                    </button>
                    {excelData.length > 0 && (
                        <>
                            <select value={sheetIndex} onChange={handleSheetChange} className="rounded bg-[#474084] px-4 py-2 text-white transition duration-300 hover:bg-[#322e5e]">
                                {sheetNames.map((sheetName, index) => (
                                    <option key={index} value={index}>
                                        {sheetName}
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleSaveChanges} className="rounded bg-green-500 px-4 py-2 text-white transition duration-300 hover:bg-green-600">
                                Save Changes
                            </button>
                            <input
                                className="h-[5vh] rounded-xl bg-[#474084] indent-3 text-white"
                                placeholder="Name..."
                                value={programName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramName(e.target.value)}
                            />
                            <button onClick={handleUploadToServer} className="rounded bg-[#3a356b] px-4 py-2 text-white transition duration-300 hover:bg-[#322e5e]">
                                Upload
                            </button>
                            <div className="text-red-500">{uploadStatus}</div>
                        </>
                    )}
                </form>
                {typeError && <p className="mt-2 text-red-500">Please select an Excel file</p>}
            </div>

            <div className="h-[80vh] flex-grow overflow-y-scroll p-4">
                {excelData.length > 0 ? (
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
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

export default EditWorkoutPlan
