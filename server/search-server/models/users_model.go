package models

// UserReq represents the data sent to the server from the client and indexed.
type UserReq struct {
	UserName         string `json:"UserName"`
	UserPrivateToken string `json:"UserPrivateToken"`
	Sport            string `json:"Sport"`
	AccountType      string `json:"AccountType"`
}

// User represents a user in the system. It contains the user's username, rating, and sport.
type User struct {
	UserName        string `json:"UserName"`
	UserPublicToken string `json:"UserPublicToken"`
	Rating          int    `json:"Rating"`
	Sport           string `json:"Sport"`
	AccountType     string `json:"AccountType"`
}

// SearchResult represents the result of a search query.
// It contains information about a user, including their username, rating, sport, and score.
type SearchResult struct {
	UserName        string
	UserPublicToken string
	Rating          int
	Sport           string
	AccountType     string
	Score           float64
}
