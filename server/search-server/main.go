package main

import (
	"search-server/config"
	"search-server/lib"
	"search-server/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"log"
	"os"
)

func main() {

	// Load the environment variables from the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Get the server host from the environment variable
	serverHost := os.Getenv("SERVER_HOST")
	if serverHost == "" {
		log.Fatalf("SERVER_HOST environment variable not set")
	}

	// Specify the folder path you want to delete
	folderPath := "users_index/"

	// Attempt to remove the folder and its contents
	ferr := os.RemoveAll(folderPath)
	if ferr != nil {
		log.Fatal(err)

		return
	}

	// Initialize the database connection
	db, err := config.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create a Gin router
	router := gin.Default()

	// Initialize the Bleve index
	index, err := lib.InitializeIndex()
	if err != nil {
		log.Fatal(err)
	}

	// Retrieve data from database
	users, err := lib.RetrieveUsersFromDB(db)
	if err != nil {
		log.Fatal("Failed to retrieve users:", err)
	}

	packages, err := lib.RetrievePackagesFromDB(db)
	if err != nil {
		log.Fatal("Failed to retrieve packages:", err)
	}

	// Index data
	err = lib.IndexData(index, users, packages)
	if err != nil {
		log.Fatal("Failed to index data:", err)
	}

	// Enable CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"} // You can specify specific origins or use "*" to allow all
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	router.Use(cors.New(config))

	// Initialize routes
	routes.InitRoutes(router, db, index)

	// Start the server
	router.Run(serverHost)

}
