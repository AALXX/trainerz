import React from 'react'
import { IPackageTemplate } from './IPackages'

const PackageTemplate = (props: IPackageTemplate) => {
    return (
        <div className="flex h-[70%] w-full flex-col self-center p-4">
            <div className="mt-8 flex w-full">
                <h1 className="self-center text-lg text-white">Price</h1>
                <h1 className="ml-2 self-center text-lg text-white">{props.price}</h1>
                <span className="text-xllg ml-1 self-center text-white">€</span>
            </div>
            <div className="mt-4 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Recurring Payment (monthly)</label>

                    <input className="form-checkbox read- h-5 w-5 rounded bg-[#474084] text-white" type="checkbox" checked={props.recurring} readOnly={true} />
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Acces to videos from this category</label>

                    <input className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white" type="checkbox" checked={props.acces_videos} readOnly={true} />
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Private 101 coaching</label>

                    <input className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white" type="checkbox" checked={props.coaching_101} readOnly={true} />
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Custom training program</label>
                    <input className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white" type="checkbox" checked={props.custom_program} readOnly={true} />
                </div>
            </div>

            <textarea className="mt-6 h-40 resize-none rounded-2xl bg-[#474084] indent-3 text-white" value={props.description} readOnly={true} />
        </div>
    )
}

export default PackageTemplate
