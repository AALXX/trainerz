import { CookieValueTypes } from 'cookies-next'
import { Dispatch, SetStateAction } from 'react'

export interface IUserPrivateData {
    username: string
    description: string
    birthDate: Date
    locationlon: string
    locationlat: string
    sport: string
    useremail: string
    phonenumber: string
    uservisibility: string
    accounttype: string
    userpublictoken: CookieValueTypes
    rating?: number
}

export interface IUserPublicData {
    username: string
    description: string
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
    packagetoken: string
    publishdate: Date
    likes: number
    dislikes: number
    visibility: string
    isOwner: boolean
    status: string
}

export interface VideoListProps {
    userPackages: Array<{ packagename: string; packagetoken: string }>
    videosData: IVideoTemplate[]
    isOwner: boolean
}
