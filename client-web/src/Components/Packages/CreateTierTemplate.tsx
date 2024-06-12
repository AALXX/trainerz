import React from 'react'
import { ICreateTierTemplate } from './IPackages'

const CreateTierTemplate = (props: ICreateTierTemplate) => {
    return (
        <div className="flex h-[70%] flex-col p-4">
            <div className="mt-2 flex h-24 w-full flex-col">
                <h1 className="text-xl text-white">Price</h1>
                <div className="relative mt-3 w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-white">€</span>
                    <input
                        className="h-[3rem] w-full rounded-xl bg-[#474084] pl-8 indent-3 text-white"
                        placeholder="Price..."
                        type="number"
                        value={props.price}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setPrice(Number(e.target.value))
                        }}
                    />
                </div>
            </div>
            <div className="mt-4 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Recurring Payment (monthly)</label>

                    <input
                        className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white"
                        type="checkbox"
                        checked={props.recurring}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setRecurring(e.target.checked)
                        }}
                    />
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Acces to videos from this category</label>

                    <input
                        className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white"
                        type="checkbox"
                        checked={props.acces_videos}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setAccesVideos(e.target.checked)
                        }}
                    />
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Private 101 coaching</label>

                    <input
                        className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white"
                        type="checkbox"
                        checked={props.coaching_101}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setCoaching101(e.target.checked)
                        }}
                    />
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col">
                <div className="relative flex items-center">
                    <label className="mr-2 text-lg text-white">Custom training program</label>

                    <input
                        className="form-checkbox h-5 w-5 rounded bg-[#474084] text-white"
                        type="checkbox"
                        checked={props.custom_program}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.setCustomProgram(e.target.checked)
                        }}
                    />
                </div>
            </div>

            <textarea
                className="mt-6 h-40 resize-none rounded-2xl bg-[#474084] indent-3 text-white"
                value={props.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.setDescription(e.target.value)}
            />
        </div>
    )
}

export default CreateTierTemplate
