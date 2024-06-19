package models

type Package struct {
	PackageToken string `json:"PackageToken"`
	OwnerToken   string `json:"OwnerToken"`
	PackageName  string `json:"PackageName"`
	PackageSport string `json:"PackageSport"`
	Rating       int    `json:"Rating"`
	Type         string // "package"
}
