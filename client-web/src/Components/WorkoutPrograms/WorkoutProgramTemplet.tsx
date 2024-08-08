import React from 'react'
import { IWorkoutProgram } from './IWorkoutPrograms'
import Link from 'next/link'

const WorkoutProgramTemplate = (program: IWorkoutProgram) => {
    return (
        <Link href={`/plan-view?t=${program.programtoken}`}>
            <div className="flex h-[20vh] w-[15vw] cursor-pointer flex-col rounded-xl bg-[#00000080]">
                <h1 className="m-auto text-lg text-white">{program.programname}</h1>
            </div>
        </Link>
    )
}

export default WorkoutProgramTemplate
