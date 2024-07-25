package models

type ChatData struct {
	ChatToken          string `json:"chatToken"`
	AthletePublicToken string `json:"athletePublicToken"`
	TrainerPublicToken string `json:"trainerPublicToken"`
	AthleteUserName    string `json:"athleteUserName"`
	TrainerUserName    string `json:"trainerUserName"`
}

type SendChatMessage struct {
	ChatToken       string `json:"chatToken"`
	UserPublicToken string `json:"userPublicToken"`
	Message         string `json:"message"`
}

type ReciveChatMessage struct {
	OwnerToken string `json:"ownerToken"`
	Message    string `json:"message"`
	SentAt     string `json:"sentat"`
}
