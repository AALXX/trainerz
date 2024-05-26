package config

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func InitDB() (*sql.DB, error) {
    	// Access the environment variables
	dbHost := os.Getenv("MYSQL_HOST")
	dbPort := os.Getenv("MYSQL_PORT")
	dbUser := os.Getenv("MYSQL_USER")
	dbPass := os.Getenv("MYSQL_PASS")

	// Construct the data source name
	dataSourceName := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		dbUser,
		dbPass,
		dbHost,
		dbPort,
		"trainerz_db",
	)

    // Open a database connection
    db, err := sql.Open("mysql", dataSourceName)
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