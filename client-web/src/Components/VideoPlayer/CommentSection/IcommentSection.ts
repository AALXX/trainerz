export interface IVideoPlayerProps {
    VideoToken: string | null
    UserPrivateToken: string | null
}

export interface ICommentCard {
    id: number
    ownerToken: string
    comment: string
    ownerName: string
    viwerPublicToken: string
    DeleteComment: (CommentID: number) => void
}
