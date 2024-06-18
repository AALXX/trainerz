import { Dispatch, SetStateAction } from 'react'

export interface IUserPrivateData {
    username: string
    description: string
    birthDate: Date
    accountfolowers: number
    locationlon: string
    locationlat: string
    sport: string
    useremail: string
    phonenumber: string
    uservisibility: string
    accounttype: string
    userpublictoken: string
    rating?: number
}

export interface IUserPublicData {
    username: string
    description: string
    accountfolowers: number
    sport: string
    useremail: string
    phonenumber: string
    uservisibility: string
    accounttype: string
    userpublictoken: string
    rating?: number
}

export interface ISelectableCards {
    Title: string
    TabName: string
    setComponentToShow: Dispatch<SetStateAction<string>>
}

export interface IAccoutSettingsPopup {
    UserName: string
    UserEmail: string
    UserVisibility: string
    UserDescription: string
    Sport: string
    AccountType: string
}

export interface IVideoTemplate {
    videotoken: string
    ownertoken: string
    packagesport: string
    videotitle: string
    publishdate: Date
    likes: number
    dislikes: number
    visibility: string
    isOwner: boolean
}
