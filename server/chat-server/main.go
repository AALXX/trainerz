package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"chat-server/config"
	"chat-server/routes"
	"chat-server/util"

	"github.com/joho/godotenv"
	"github.com/zishang520/engine.io/v2/types"
	"github.com/zishang520/socket.io/v2/socket"
)

func main() {
	// Initialize logger
	util.InitLogger()
	// Load the environment variables from the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
    
    log.Println("Starting ChatServer")

	// Initialize the database connection
	err = config.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	// Initialize socket.io server
	io := socket.NewServer(nil, nil)
	io.Opts().SetCors(&types.Cors{
		Origin: "*",
        
	})

	// Setup socket.io route
	routes.SetupSocketRoute(io)

	// Start HTTP server
	go func() {
		if err := http.ListenAndServe(":7250", nil); err != nil {
			log.Fatalf("HTTP server failed: %v", err)
		}
	}()

	// Handle OS signals for graceful shutdown
	exit := make(chan struct{})
	signalC := make(chan os.Signal, 1)
	signal.Notify(signalC, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-signalC
		log.Println("Shutting down server...")

		// Close resources, like socket.io server
		io.Close(nil)

		close(exit)
	}()

	<-exit
	log.Println("Server stopped gracefully.")
}
