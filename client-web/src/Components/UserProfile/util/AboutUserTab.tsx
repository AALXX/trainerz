import React from 'react'

const AboutChanelTab = (props: { userDescription: string; userEmail: string; userPhone: string }) => {
    return (
        <div className="flex h-full w-full flex-col md:flex-row">
            <div className="ml-4 mt-4 flex h-64 w-[35rem] flex-col rounded-2xl bg-[#0000005e]">
                <h1 className="ml-3 mt-3 text-lg text-white">Description:</h1>
                <hr className="mt-3" />
                <textarea className="mt-3 h-16 w-full resize-none bg-transparent indent-2 text-lg text-white" readOnly>
                    {props.userDescription}
                </textarea>
            </div>
            <div className="ml-auto mr-4 mt-4 flex h-64 w-[35rem] flex-col rounded-2xl bg-[#0000005e]">
                <h1 className="ml-3 mt-3 text-lg text-white">You can contact me here:</h1>
                <hr className="mt-3" />
                <h1 className="ml-3 mt-3 text-lg text-white">Email: {props.userEmail}</h1>
                <h1 className="ml-3 mt-3 text-lg text-white">Phone: {props.userPhone}</h1>
            </div>
        </div>
    )
}
export default AboutChanelTab
