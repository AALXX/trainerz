import React from 'react'
import { IWorkoutProgram } from './IWorkoutPrograms'
import Link from 'next/link'

const WorkoutProgramTemplate = (program: IWorkoutProgram) => {
    return (
        <Link href={`/plan-view?t=${program.programtoken}`}>
            <div className="flex h-[20vh] w-[15vw] cursor-pointer flex-col rounded-xl bg-[#00000080] p-4">
                <Link href={`/account/plans/edit-plan?t=${program.programtoken}`}>
                    <img src="/assets/AccountIcons/Settings_icon.svg" alt="Workout Program Icon" className="relative z-10 ml-auto h-5 w-5" />
                </Link>
                <h1 className="m-auto text-lg text-white">{program.programname}</h1>
            </div>
        </Link>
    )
}

export default WorkoutProgramTemplate
