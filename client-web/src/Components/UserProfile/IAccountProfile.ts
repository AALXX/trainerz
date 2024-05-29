import { Dispatch, SetStateAction } from 'react'

export interface IUserData {
    username: string
    description: string
    birthDate: Date
    accountfolowers:number,
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