package util

import (
	"chat-server/config"
	"log"
)

func InitLogger() {
	log.SetPrefix("[CHAT-SERVER] ")
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

func GiveWorkoutPresmission(workoutProgramToken string, athletePublicToken string, trainerPrivateToken string) (bool, error) {

	permissions_row, err := config.ExecutePostgresQuery("SELECT * FROM program_premissions WHERE ProgramToken = $1 AND UserPublicToken = $2;", workoutProgramToken, athletePublicToken)
	if err != nil {
		log.Printf("Error getting user public token: %v\n", err)
		return false, err
	}

	if permissions_row == nil || len(permissions_row) == 0 {

		insertRow, err := config.ExecutePostgresQuery("INSERT INTO program_premissions (ProgramToken, UserPublicToken) VALUES ($1, $2) ", workoutProgramToken, athletePublicToken)

		if err != nil {
			log.Printf("Error getting program token: %v\n", err)
			return false, err
		}
		log.Printf("inserted: %s\n", insertRow)

		return true, nil
	}

	return true, nil

}
