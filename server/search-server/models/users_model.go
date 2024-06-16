package models

// UserReq represents the data sent to the server from the client and indexed.
type UserReq struct {
	UserName         string `json:"UserName"`
	UserPrivateToken string `json:"UserPrivateToken"`
	Sport            string `json:"Sport"`
	AccountType      string `json:"AccountType"`
	Description      string `json:"Description"`
	Type             string // "user"
}

// User represents a user in the system. It contains the user's username, rating, and sport.
type User struct {
	UserName        string `json:"UserName"`
	UserPublicToken string `json:"UserPublicToken"`
	Rating          int    `json:"Rating"`
	Sport           string `json:"Sport"`
	Description     string `json:"Description"`
	AccountType     string `json:"AccountType"`
	Type            string // "user"
}
