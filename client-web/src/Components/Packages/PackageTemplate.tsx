import React from 'react'
import { IPackageTemplate } from './IPackages'

const PackageTemplate = (props: IPackageTemplate) => {
    return (
        <div className="flex flex-col h-[70%] p-4 ">
            <div className="flex flex-col w-full h-24 mt-2">
                <h1 className="text-xl text-white">Price</h1>
                <div className="relative mt-3 w-full">
                    <h1 className=" text-white">{props.price}</h1>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">€</span>
                </div>
            </div>
            <div className="flex flex-col w-full  mt-4 ">
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
