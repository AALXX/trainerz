'use client'
import { IWorkoutProgram } from '@/Components/WorkoutPrograms/IWorkoutPrograms'
import WorkoutProgramTemplate from '@/Components/WorkoutPrograms/WorkoutProgramTemplet'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'

const WorkoutPlans = () => {
    const [programs, setPrograms] = useState<IWorkoutProgram[]>([])

    useEffect(() => {
        ;(async () => {
            const res = await axios.get(`${process.env.SERVER_BACKEND}/programs-manager/get-all-programs/${getCookie('userToken')}`)
            setPrograms(res.data.programs)
        })()
    }, [])

    return (
        <div className="h-full flex flex-col">
            <Link href={'/account/plans/edit'}>Create</Link>

            <>
                <div className="mt-4 grid h-full w-[95%] gap-4 self-center overflow-y-scroll sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {programs.map((program: IWorkoutProgram, index: number) => (
                        <WorkoutProgramTemplate programname={program.programname} programtoken={program.programtoken} key={index} />
                    ))}
                </div>
            </>
        </div>
    )
}

export default WorkoutPlans
