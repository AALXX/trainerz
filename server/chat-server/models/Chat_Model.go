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
	Type            string `json:"type"`
	FileName        string `json:"fileName"`
}

type ReciveChatMessage struct {
	Id         string `json:"id"`
	OwnerToken string `json:"ownerToken"`
	Message    string `json:"message"`
	Type       string `json:"type"`
	SentAt     string `json:"sentat"`
}

type WorkoutProgram struct {
	ProgramToken string `json:"programToken"`
	ProgramName  string `json:"programName"`
}
