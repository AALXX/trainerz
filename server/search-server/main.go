package main

import (
	"search-server/config"
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
	index, err := config.InitializeIndex()
	if err != nil {
		log.Fatal(err)
	}

	// Retrieve data from MySQL (replace this with your database query)
	users, err := config.RetrieveDataFromMySQL(db)
	if err != nil {
		log.Fatal(err)
	}

	// Index the retrieved data into the Bleve index
	err = config.IndexData(index, users)
	if err != nil {
		log.Fatal(err)
	}

	// Enable CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"} // You can specify specific origins or use "*" to allow all
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	router.Use(cors.New(config))

	// Initialize routes
	routes.InitRoutes(router, db, index)

	// Start the server
	router.Run("172.31.5.46:7300")
}
