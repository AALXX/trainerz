import React from 'react'

const AboutChanelTab = (props: { userDescription: string; userEmail: string; userPhone: string }) => {
    return (
        <div className="flex w-full h-full ">
            <div className="flex flex-col bg-[#0000005e] w-[35rem] rounded-2xl mt-4 ml-4 h-64 ">
                <h1 className="text-white text-lg mt-3 ml-3">Description:</h1>
                <hr className="mt-3" />
                <textarea className="text-white mt-3 text-lg bg-transparent  h-16 w-full resize-none indent-2" readOnly>
                    {props.userDescription}
                </textarea>
            </div>
            <div className="flex flex-col bg-[#0000005e] w-[35rem] rounded-2xl mt-4 mr-4 ml-auto h-64 ">
                <h1 className="text-white text-lg mt-3 ml-3">You can contact me here:</h1>
                <hr className="mt-3" />
                <h1 className="text-white text-lg mt-3 ml-3">Email: {props.userEmail}</h1>
                <h1 className="text-white text-lg mt-3 ml-3">Phone: {props.userPhone}</h1>
            </div>
        </div>
    )
}
export default AboutChanelTab
