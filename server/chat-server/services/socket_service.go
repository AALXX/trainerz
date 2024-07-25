package services

import (
	"chat-server/config"
	"chat-server/models"
	"fmt"
	"log"

	"github.com/lib/pq"
	"github.com/zishang520/socket.io/v2/socket"
)

func SocketConnectionHandler(clients ...interface{}) {
	client := clients[0].(*socket.Socket)

	client.On("get-chats", func(data ...interface{}) {
		if len(data) == 0 {
			log.Println("No data received")
			return
		}

		dataMap, ok := data[0].(map[string]interface{})
		if !ok {
			log.Println("Data is not a map")
			return
		}

		userPrivateToken, ok := dataMap["userPrivateToken"].(string)
		if !ok {
			log.Println("userPrivateToken not found or not a string")
			return
		}

		row, err := config.ExecutePostgresQueryRow("SELECT UserPublicToken FROM users WHERE UserPrivateToken = $1", userPrivateToken)
		if err != nil {
			log.Printf("Error getting user public token: %v\n", err)
			return
		}
		userPublicToken, ok := row["userpublictoken"].(string)
		if !ok {
			log.Println("UserPublicToken not found or not a string")
			return
		}

		query := "SELECT chatToken, athlete_public_token, trainer_public_token FROM Chats_by_AthletePublicToken WHERE athlete_public_token = ? ALLOW FILTERING"
		rows1, err := config.ExecuteScyllaQuery(query, userPublicToken)
		if err != nil {
			log.Printf("Error querying chats: %v\n", err)
			return
		}

		query = "SELECT chatToken, athlete_public_token, trainer_public_token FROM Chats_by_TrainerPublicToken WHERE trainer_public_token = ? ALLOW FILTERING"
		rows2, err := config.ExecuteScyllaQuery(query, userPublicToken)
		if err != nil {
			log.Printf("Error querying chats: %v\n", err)
			return
		}

		var rows []map[string]interface{}
		rows = append(rows, rows1...)
		rows = append(rows, rows2...)

		var chatData []models.ChatData
		var publicTokens []string
		publicTokensMap := make(map[string]bool)

		for _, row := range rows {
			chat := models.ChatData{
				ChatToken:          fmt.Sprint(row["chattoken"]),
				AthletePublicToken: fmt.Sprint(row["athlete_public_token"]),
				TrainerPublicToken: fmt.Sprint(row["trainer_public_token"]),
			}
			chatData = append(chatData, chat)

			if chat.AthletePublicToken != userPublicToken && !publicTokensMap[chat.AthletePublicToken] {
				publicTokens = append(publicTokens, chat.AthletePublicToken)
				publicTokensMap[chat.AthletePublicToken] = true
			}
			if chat.TrainerPublicToken != userPublicToken && !publicTokensMap[chat.TrainerPublicToken] {
				publicTokens = append(publicTokens, chat.TrainerPublicToken)
				publicTokensMap[chat.TrainerPublicToken] = true
			}
		}

		query = "SELECT UserPublicToken, UserName FROM users WHERE UserPublicToken = ANY($1)"
		usernameRows, err := config.ExecutePostgresQuery(query, pq.Array(publicTokens))
		if err != nil {
			log.Printf("Error querying usernames: %v\n", err)
			return
		}

		usernameMap := make(map[string]string)
		for _, row := range usernameRows {
			publicToken, ok1 := row["userpublictoken"].(string)
			username, ok2 := row["username"].(string)
			if ok1 && ok2 {
				usernameMap[publicToken] = username
			}
		}

		for i, chat := range chatData {
			if chat.AthletePublicToken == userPublicToken {
				chatData[i].AthleteUserName = "You"
				chatData[i].TrainerUserName = usernameMap[chat.TrainerPublicToken]
			} else {
				chatData[i].TrainerUserName = "You"
				chatData[i].AthleteUserName = usernameMap[chat.AthletePublicToken]
			}
		}

		client.Emit("account-chats", chatData)
	})

	client.On("join-chat", func(data ...interface{}) {
	    if len(data) == 0 {
	        log.Println("No data received for join-chat")
	        return
	    }

	    chatRoomStr := fmt.Sprintf("%v", data[0])
	    chatRoom := socket.Room(chatRoomStr)
	    client.Join(chatRoom)

	    rows, err := config.ExecuteScyllaQuery("SELECT OwnerToken, Message, SentAt FROM Messages_by_ChatToken WHERE ChatToken = ?", chatRoomStr)
	    if err != nil {
	        log.Printf("Error querying messages: %v\n", err)
	        return
	    }

	    var messages []models.ReciveChatMessage
	    for _, row := range rows {
	        message := models.ReciveChatMessage{
	            OwnerToken: fmt.Sprint(row["ownertoken"]),
	            Message:    fmt.Sprint(row["message"]),
	            SentAt:     fmt.Sprint(row["sentat"]),
	        }
	        messages = append(messages, message)
	    }

	    client.Emit("messages", messages)
	})

	client.On("leave-chat", func(data ...interface{}) {
		if len(data) == 0 {
			log.Println("No data received for join-chat")
			return
		}

		chatRoomStr := fmt.Sprintf("%v", data[0])
		chatRoom := socket.Room(chatRoomStr)
		client.Leave(chatRoom)
	})

	client.On("chat message", func(data ...interface{}) {
		if len(data) == 0 {
			log.Println("No data received for chat message")
			return
		}

		dataMap, ok := data[0].(map[string]interface{})
		if !ok {
			log.Println("Data is not a map")
			return
		}

		row, err := config.ExecutePostgresQueryRow("SELECT UserPublicToken FROM users WHERE UserPrivateToken = $1", dataMap["UserPrivateToken"].(string))
		if err != nil {
			log.Printf("Error getting user public token: %v\n", err)
			return
		}
		userPublicToken, ok := row["userpublictoken"].(string)
		if !ok {
			log.Println("UserPublicToken not found or not a string")
			return
		}

		chatMessage := models.SendChatMessage{
			ChatToken:       dataMap["ChatToken"].(string),
			UserPublicToken: userPublicToken,
			Message:         dataMap["message"].(string),
		}

		log.Printf("Message received: %+v\n", chatMessage)

		insertRow, err := config.ExecuteScyllaQuery("INSERT INTO DirectMessages (id, ChatToken, OwnerToken, Message, SentAt) VALUES (uuid(),?,?,?, toTimestamp(now()))", dataMap["ChatToken"].(string), userPublicToken, dataMap["message"].(string))
		if err != nil {
			log.Printf("Error getting user public token: %v\n", err)
			return
		}

		room := socket.Room(chatMessage.ChatToken)
		client.Broadcast().To(room).Emit("message", chatMessage)
		log.Printf("Message broadcasted to room: %s\n", insertRow)
	})

	client.On("disconnect", func(...interface{}) {
		log.Println("Client disconnected")
	})
}
