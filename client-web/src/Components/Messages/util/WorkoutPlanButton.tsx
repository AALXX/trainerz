import React from 'react'
import { IWorkoutProgramButton } from '../IChatMessages'

const WorkoutPlanButton = (program: IWorkoutProgramButton) => {
    return (
        <div className="flex h-[20vh] w-[15vw] cursor-pointer flex-col rounded-xl bg-[#00000080]" onClick={(e) => program.sendAttachment(e, program.programtoken, program.programname)}>
            <h1 className="m-auto text-lg text-white">{program.programname}</h1>
        </div>
    )
}

export default WorkoutPlanButton