import React, { ReactNode } from 'react'

interface IPopupCanvasProps {
    closePopup: () => void
    children: ReactNode
}

const PopupCanvas = (props: IPopupCanvasProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative mx-auto h-[90vh] w-[95%] max-w-7xl overflow-y-auto rounded-lg bg-gradient-to-tr from-[#1E3B80] to-[#784EB9] shadow-xl sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2">
                <button className="absolute right-2 top-2 text-white hover:text-gray-300 focus:outline-none" onClick={props.closePopup} aria-label="Close">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                <div className="p-4 sm:p-6 md:p-8">{props.children}</div>
            </div>
        </div>
    )
}

export default PopupCanvas
