import { Dispatch, SetStateAction } from 'react'

export interface ITierTemplate {
    tierPrice: number
    recurring: boolean
    acces_videos: boolean
    coaching_101: boolean
    custom_program: boolean
    description: string
}

export interface ICreateTierTemplate {
    price: number
    setPrice: Dispatch<SetStateAction<number>>
    recurring: boolean
    setRecurring: Dispatch<SetStateAction<boolean>>
    acces_videos: boolean
    setAccesVideos: Dispatch<SetStateAction<boolean>>
    coaching_101: boolean
    setCoaching101: Dispatch<SetStateAction<boolean>>
    custom_program: boolean
    setCustomProgram: Dispatch<SetStateAction<boolean>>
    description: string
    setDescription: Dispatch<SetStateAction<string>>
}

export interface IPackageTemplate {
    price: number
    recurring: boolean
    acces_videos: boolean
    coaching_101: boolean
    custom_program: boolean
    description: string
}

export interface IPackageData {
    price: number
    recurring: boolean
    acces_videos: boolean
    coaching_101: boolean
    custom_program: boolean
    priceId: string
    description: string
}

export interface IAccountPackages {
    packagetoken: string
    ownertoken: string
    packagename: string
    packagesport: string
    rating: number
    isOwner: boolean
}
