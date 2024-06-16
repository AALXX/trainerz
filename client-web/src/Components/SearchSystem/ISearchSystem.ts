export interface ISearchResults {
    Type: string
    UserName: string
    UserPublicToken: string
    Rating: number
    AccountType: string
    Sport: string
    PackageToken: string
    AccountDescription: string
    OwnerToken: string
    PackageName: string
    PackageSport: string
}

export interface IPackageCard {
    PackageToken: string
    OwnerToken: string
    PackageName: string
    PackageSport: string
    Rating: number
}

export interface IAccountProfile {
    UserName: string
    UserPublicToken: string
    Rating: number
    AccountType: string
    Sport: string
    AccountDescription: string
}
