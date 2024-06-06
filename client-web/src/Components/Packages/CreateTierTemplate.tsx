import React from 'react'
import { ICreateTierTemplate } from './IPackages'

const CreateTierTemplate = (props: ICreateTierTemplate) => {
    return (
        <div className="flex flex-col h-[70%] p-4 ">
            <div className="flex flex-col w-full h-24 mt-2">
                <h1 className="text-xl text-white">Price</h1>
                <div className="relative mt-3 w-full">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">€</span>
                    <input
                        className="text-white bg-[#474084] w-full h-[3rem] pl-8 indent-3 rounded-xl"
                        placeholder="Price..."
                        type="number"
                        value={props.price}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setPrice(Number(e.target.value))
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full  mt-4 ">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Recurring Payment (monthly)</label>

                    <input
                        className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded"
                        type="checkbox"
                        checked={props.recurring}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setRecurring(e.target.checked)
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full mt-6">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Acces to videos from this category</label>

                    <input
                        className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded"
                        type="checkbox"
                        checked={props.acces_videos}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setAccesVideos(e.target.checked)
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full mt-6">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Private 101 coaching</label>

                    <input
                        className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded"
                        type="checkbox"
                        checked={props.coaching_101}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setCoaching101(e.target.checked)
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full mt-6">
                <div className="relative  flex items-center">
                    <label className="mr-2 text-lg text-white">Custom training program</label>

                    <input
                        className="form-checkbox h-5 w-5 text-white bg-[#474084] rounded"
                        type="checkbox"
                        checked={props.custom_program}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setCustomProgram(e.target.checked)
                        }}
                    />
                </div>
            </div>

            <textarea
                className="h-40  rounded-2xl bg-[#474084] resize-none text-white indent-3 mt-6"
                value={props.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.setDescription(e.target.value)}
            />
        </div>
    )
}

export default CreateTierTemplate
