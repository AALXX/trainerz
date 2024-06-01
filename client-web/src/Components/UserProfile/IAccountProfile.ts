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
    accountprice?: number
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
    accountprice?: number
}

export interface IProfileCards {
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
    AccountPrice?: number
}

export interface IVideoTemplate {
    videotoken: string
    ownertoken: string
    videotitle: string
    publishdate: Date
    videoprice: Date
    likes: number
    dislikes: number
    sportname: string
    visibility: string
    isOwner: boolean
}
