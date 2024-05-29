package config

import (
	"database/sql"
	"os"

	"fmt"
	"search-server/models"

	"github.com/blevesearch/bleve"
	_ "github.com/lib/pq"
)

func InitDB() (*sql.DB, error) {

	// Access the environment variables
	dbHost := os.Getenv("POSTGRESQL_HOST")
	dbPort := os.Getenv("POSTGRESQL_PORT")
	dbUser := os.Getenv("POSTGRESQL_USER")
	dbPass := os.Getenv("POSTGRESQL_PASS")
	dbName := os.Getenv("POSTGRESQL_DB")


	// Construct the data source name
	dataSourceName := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost,
		dbPort,
		dbUser,
		dbPass,
		dbName,
	)

	// Open a database connection
	db, err := sql.Open("postgres", dataSourceName)
	if err != nil {
		return nil, err
	}

	// Check if the connection is valid by pinging the database
	if err := db.Ping(); err != nil {
		db.Close() // Close the connection
		return nil, err
	}

	return db, nil
}

func InitializeIndex() (bleve.Index, error) {
	// Create or open a Bleve index
	mapping := bleve.NewIndexMapping()
	index, err := bleve.Open("users_index")
	if err != nil {
		index, err = bleve.New("users_index", mapping)
		if err != nil {
			return nil, err
		}
	}
	return index, nil
}

func RetrieveDataFromMySQL(db *sql.DB) ([]models.User, error) {
	rows, err := db.Query("SELECT u.UserName, u.Sport, u.UserPublicToken, u.AccountType, COALESCE(r.Rating, 0) AS Rating FROM users u LEFT JOIN ratings r ON u.UserPublicToken = r.UserToken;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User

		if err := rows.Scan(&user.UserName, &user.Sport, &user.UserPublicToken, &user.AccountType, &user.Rating); err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func IndexData(index bleve.Index, users []models.User) error {
	// Index data from the MySQL database
	for i := 0; i < len(users); i++ {

		// Create a Bleve document as a map
		bleveDoc := map[string]interface{}{
			"UserName":        users[i].UserName,
			"UserPublicToken": users[i].UserPublicToken,
			"AccountType":          users[i].AccountType,
			"Rating":          users[i].Rating,
			"Sport":           users[i].Sport,
		}

		// Index the document
		if err := index.Index(users[i].UserPublicToken, bleveDoc); err != nil {
			return err
		}
	}
	return nil
}

// Function to open or create an index
func openOrCreateIndex(indexName string) (bleve.Index, error) {
	indexMapping := bleve.NewIndexMapping()
	index, err := bleve.Open(indexName)
	if err == bleve.ErrorIndexPathDoesNotExist {
		// Create a new index if it doesn't exist
		index, err = bleve.New(indexName, indexMapping)
	}
	return index, err
}

func GetPublicTokenByPrivateToken(PrivateToken string, db *sql.DB) string {
	rows, err := db.Query("SELECT UserPublicToken FROM users WHERE UserPrivateToken=?;", PrivateToken)
	if err != nil {
		return "error"
	}
	defer rows.Close()

	var userPublicToken string

	for rows.Next() {
		if err := rows.Scan(&userPublicToken); err != nil {
			return "error"
		}
	}

	if err := rows.Err(); err != nil {
		return "error"
	}

	return userPublicToken
}
func GetAccountRating(PublicToken string, db *sql.DB) int {
	rows, err := db.Query("select Rating from ratings WHERE UserToken=?;", PublicToken)
	if err != nil {
		return 0
	}
	defer rows.Close()

	var Rating int

	for rows.Next() {
		if err := rows.Scan(&Rating); err != nil {
			return 0
		}
	}

	if err := rows.Err(); err != nil {
		return 0
	}

	return Rating
}

