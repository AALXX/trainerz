import { Dispatch, SetStateAction } from "react"

export interface IVideoPlayerProps {
    VideoToken: string | null
    setPackageName?: Dispatch<SetStateAction<string>>
    setPackageRating?: Dispatch<SetStateAction<number>>
}

export interface ICommentSection extends IVideoPlayerProps {
    PackageName: string
    PackageRating: number
}


export interface ICommentCard {
    id: number
    ownerToken: string
    comment: string
    ownerName: string
    viwerPublicToken: string
    DeleteComment: (CommentID: number) => void
}
