import React, { ReactNode } from 'react'

interface IPopupCanvasProps {
    closePopup: () => void
    children: ReactNode
}

const PopupCanvas = (props: IPopupCanvasProps) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 m-auto h-[100%] w-[100%] bg-[#0000005b]">
            <div className="absolute bottom-[25%] left-[25%] right-[25%] top-[25%] z-10 m-auto flex h-[88vh] w-[50vw] flex-col items-center overflow-y-scroll rounded-2xl bg-gradient-to-tr from-[#1E3B80] to-[#784EB9]">
                <button className="ml-auto mr-[1vw] mt-[1vh] cursor-pointer bg-transparent text-[#ffffff] outline-none" onClick={props.closePopup}>
                    &#9587;
                </button>
                <>{props.children}</>
            </div>
        </div>
    )
}

export default PopupCanvas
