package models

// User represents a user in the system. It contains the user's username, rating, and sport.
type Package struct {
	PackageName  string `json:"PackageName"`
	PackageToken string `json:"PackageToken"`
	OwnerToken   string `json:"OwnerToken"`
	PackageSport string `json:"PackageSport"`
	Rating       int    `json:"Rating"`
	Type         string // "package"

}
