'use client'
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import LoadingScreen from '@/Components/CommonUi/LoadingScreen'
import { useSearchParams } from 'next/navigation'

interface WorkbookType {
    Sheets: {
        [key: string]: XLSX.WorkSheet
    }
    SheetNames: string[]
}

interface ExcelDataType {
    [key: string]: string | number
}

const CHUNK_SIZE = 1024 * 1024 // 1MB chunks, adjust as needed

const EditWorkoutPlan = () => {
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

    const handleCellEdit = useCallback((row: number, col: string, value: any) => {
        setEditCell({ row, col })
        setEditValue(value.toString())
    }, [])

    const handleSaveEdit = useCallback(() => {
        if (editCell && workbook) {
            setExcelData(prevData => {
                const newData = [...prevData]
                newData[editCell.row][editCell.col] = editValue

                const worksheet = workbook.Sheets[sheetNames[sheetIndex]]
                const cellRef = XLSX.utils.encode_cell({ r: editCell.row + 1, c: Object.keys(newData[0]).indexOf(editCell.col) })

                worksheet[cellRef] = { t: 's', v: editValue }

                setWorkbook(prevWorkbook => ({
                    ...prevWorkbook!,
                    Sheets: { ...prevWorkbook!.Sheets, [sheetNames[sheetIndex]]: worksheet }
                }))

                setUnsavedChanges(true)
                return newData
            })

            setEditCell(null)
            setEditValue('')
        }
    }, [editCell, editValue, workbook, sheetIndex, sheetNames])

    const handleSheetChange = useCallback(
        async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const index = parseInt(e.target.value)

            if (unsavedChanges) {
                const confirmed = window.confirm('You have unsaved changes. Do you want to save them before switching sheets?')
                if (confirmed) {
                    handleSaveEdit()
                    await handleSaveChanges()
                }
            }

            setSheetIndex(index)

            if (workbook) {
                setLoading(true)
                setExcelData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[index]], { defval: '' }))
                setLoading(false)
                setUnsavedChanges(false)
            }
        },
        [workbook, sheetNames, unsavedChanges, handleSaveEdit]
    )

    const handleSaveChanges = useCallback(async () => {
        if (workbook && workbook.SheetNames.length > 0) {
            try {
                // Convert the workbook to an ArrayBuffer
                const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

                // Create a Blob from the buffer
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

                // Prepare FormData for the upload
                const formData = new FormData()
                formData.append('workoutProgram', blob, 'workout_plan.xlsx') // Customize the file name if necessary
                formData.append('ProgramToken', urlParams.get('t') || '')
                formData.append('UserPrivateToken', getCookie('userToken') as string)

                // Upload the file to the server
                const response = await axios.post(`${process.env.SERVER_BACKEND}/programs-manager/update-workout-program`, formData)

                if (response.data.error) {
                    throw new Error(response.data.errormsg)
                }

                setUnsavedChanges(false)
                setUploadStatus('Changes saved successfully!')
            } catch (error) {
                console.error('Error saving changes:', error)
                setUploadStatus('Error saving changes. Please try again.')
            }
        } else {
            setUploadStatus('No data to save.')
        }
    }, [workbook, urlParams])

    const handleAddRow = useCallback(() => {
        setExcelData(prevData => {
            const newData = [...prevData]

            // Create a new row with empty strings for each column
            const newRow = {} as any
            Object.keys(newData[0] || {}).forEach(key => {
                newRow[key] = '' // Initialize new cell values as empty strings
            })
            newData.push(newRow)

            // Update the worksheet in the workbook
            const worksheet = workbook!.Sheets[sheetNames[sheetIndex]]

            // Add the new row to the worksheet
            XLSX.utils.sheet_add_json(worksheet, [newRow], { skipHeader: true, origin: -1 })

            // Ensure the range of the worksheet is updated
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
            range.e.r = range.e.r + 1 // Extend the range by one row
            worksheet['!ref'] = XLSX.utils.encode_range(range)

            // Update the workbook state
            setWorkbook(prevWorkbook => ({
                ...prevWorkbook!,
                Sheets: { ...prevWorkbook!.Sheets, [sheetNames[sheetIndex]]: worksheet }
            }))

            setUnsavedChanges(true)
            return newData
        })
    }, [workbook, sheetNames, sheetIndex])

    const handleDeleteProgram = async() => {
        const resp = await axios.post(`${process.env.SERVER_BACKEND}/programs-manager/delete-workout-program`, {
            ProgramToken: urlParams.get('t'),
            UserPrivateToken: getCookie('userToken')
        })

        if (resp.data.error) {
            window.alert(resp.data.errormsg)
        } else {
            window.location.href = '/account/plans'
        }
    }

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
                            <td
                                key={colIndex}
                                className={`border border-gray-300 p-2 text-sm ${editCell?.row === rowIndex && editCell?.col === key ? 'bg-yellow-100' : 'bg-white hover:bg-gray-100'}`}
                                onClick={() => handleCellEdit(rowIndex, key, value)}
                            >
                                {editCell?.row === rowIndex && editCell?.col === key ? (
                                    <textarea value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveEdit} autoFocus className="w-full border-none bg-transparent focus:outline-none" />
                                ) : (
                                    <div>{value as React.ReactNode}</div>
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        ) : null
    }, [excelData, editCell, editValue, handleCellEdit, handleSaveEdit])

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
                            <button
                                onClick={e => {
                                    e.preventDefault()
                                    handleSaveChanges()
                                }}
                                className="rounded bg-[#0000003d] px-4 py-2 text-white transition duration-300 hover:bg-[#00000070]"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={e => {
                                    e.preventDefault()
                                    handleAddRow()
                                }}
                                className="rounded bg-[#0000003d] px-4 py-2 text-white transition duration-300 hover:bg-[#00000070]"
                            >
                                Add Row
                            </button>

                            <button
                                onClick={e => {
                                    e.preventDefault()
                                    handleDeleteProgram()
                                }}
                                className="rounded bg-[#d31b1b7e] px-4 py-2 text-white transition duration-300 hover:bg-[#d31b1ba4]"
                            >
                                Delete
                            </button>

                            <div className="text-red-500">{uploadStatus}</div>
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

export default EditWorkoutPlan
