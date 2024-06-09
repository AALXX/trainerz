import React from 'react'
import { IPackageTemplate } from './IPackages'

const PackageTemplate = (props: IPackageTemplate) => {
    return (
        <div className="flex flex-col h-[70%] p-4 self-center w-full">
            <div className="flex  w-full mt-8">
                <h1 className="self-center text-lg text-white">Price</h1>
                <h1 className="self-center text-lg text-white ml-2">{props.price}</h1>
                <span className="self-center text-xllg ml-1 text-white">€</span>
            </div>
            <div className="flex flex-col w-full mt-4 ">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Recurring Payment (monthly)</label>

                    <input className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded read-" type="checkbox" checked={props.recurring} readOnly={true} />
                </div>
            </div>
            <div className="flex flex-col w-full mt-6">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Acces to videos from this category</label>

                    <input className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded" type="checkbox" checked={props.acces_videos} readOnly={true} />
                </div>
            </div>
            <div className="flex flex-col w-full mt-6">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Private 101 coaching</label>

                    <input className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded" type="checkbox" checked={props.coaching_101} readOnly={true} />
                </div>
            </div>
            <div className="flex flex-col w-full mt-6">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Custom training program</label>
                    <input className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded" type="checkbox" checked={props.custom_program} readOnly={true} />
                </div>
            </div>

            <textarea className="h-40  rounded-2xl bg-[#474084] resize-none text-white indent-3 mt-6" value={props.description} readOnly={true} />
        </div>
    )
}

export default PackageTemplate
