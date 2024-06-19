package models

// SearchResult represents the result of a search query.
// It contains information about a user, including their username, rating, sport, and score.
type SearchResult struct {
	Type               string
	UserName           string
	UserPublicToken    string
	Rating             int
	AccountType        string
	Sport              string
	PackageToken       string
	OwnerToken         string
	PackageName        string
	AccountDescription string
}
