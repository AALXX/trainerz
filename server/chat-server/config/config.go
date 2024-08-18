package config

import (
    "fmt"
    "os"
    "strconv"
    "time"
    "database/sql"

    "github.com/gocql/gocql"
    _ "github.com/lib/pq"
)

var session *gocql.Session
var pgDB *sql.DB

// InitDB initializes the ScyllaDB and PostgreSQL connections
func InitDB() error {
    err := initScyllaDB()
    if err != nil {
        return fmt.Errorf("failed to initialize ScyllaDB: %w", err)
    }

    err = initPostgresDB()
    if err != nil {
        return fmt.Errorf("failed to initialize PostgreSQL: %w", err)
    }

    return nil
}


// initScyllaDB  initializes the ScyllaDB connection
func initScyllaDB() error {
    dbHost := os.Getenv("SCYLLA_HOST")
    dbPort := os.Getenv("SCYLLA_PORT")
    dbUser := os.Getenv("SCYLLA_USER")
    dbPass := os.Getenv("SCYLLA_PASSWORD")
    dbKeyspace := os.Getenv("SCYLLA_KEYSPACE")
    dbDatacenter := os.Getenv("SCYLLA_DATACENTER")

    port, err := strconv.Atoi(dbPort)
    if err != nil {
        port = 9042 // default port for ScyllaDB
    }

    cluster := gocql.NewCluster(dbHost)
    cluster.Port = port
    cluster.Keyspace = dbKeyspace
    cluster.Authenticator = gocql.PasswordAuthenticator{
        Username: dbUser,
        Password: dbPass,
    }
    cluster.HostFilter = gocql.DataCentreHostFilter(dbDatacenter)

    // Creating session
    session, err = cluster.CreateSession()
    if err != nil {
        return fmt.Errorf("failed to create session: %w", err)
    }

    return nil
}

// initPostgresDB initializes the PostgreSQL connection
func initPostgresDB() error {
    pgHost := os.Getenv("POSTGRES_HOST")
    pgPort := os.Getenv("POSTGRES_PORT")
    pgUser := os.Getenv("POSTGRES_USER")
    pgPass := os.Getenv("POSTGRES_PASSWORD")
    pgDBName := os.Getenv("POSTGRES_DB")

    dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        pgHost, pgPort, pgUser, pgPass, pgDBName)

    var err error
    pgDB, err = sql.Open("postgres", dsn)
    if err != nil {
        return fmt.Errorf("failed to connect to PostgreSQL: %w", err)
    }

    // Verify the connection
    err = pgDB.Ping()
    if err != nil {
        return fmt.Errorf("failed to ping PostgreSQL: %w", err)
    }

    return nil
}

// Reconnect to the ScyllaDB cluster
func reconnect() {
    for {
        err := InitDB()
        if err == nil {
            break
        }
        fmt.Println("Reconnection error:", err)
        time.Sleep(5 * time.Second)
    }
}

// ExecuteScyllaQuery executes a CQL query and returns the result rows
func ExecuteScyllaQuery(query string, args ...interface{}) ([]map[string]interface{}, error) {
    if session == nil {
        reconnect()
    }

    iter := session.Query(query, args...).Iter()
    defer iter.Close()

    var rows []map[string]interface{}
    for {
        row := make(map[string]interface{})
        if !iter.MapScan(row) {
            break
        }
        rows = append(rows, row)
    }

    if err := iter.Close(); err != nil {
        return nil, fmt.Errorf("query error: %w", err)
    }

    return rows, nil
}

// ExecutePostgresQuery executes a parameterized SQL query on PostgreSQL and returns the result rows
func ExecutePostgresQuery(query string, args ...interface{}) ([]map[string]interface{}, error) {
    rows, err := pgDB.Query(query, args...)
    if err != nil {
        return nil, fmt.Errorf("query error: %w", err)
    }
    defer rows.Close()

    columns, err := rows.Columns()
    if err != nil {
        return nil, fmt.Errorf("failed to get columns: %w", err)
    }

    var result []map[string]interface{}
    for rows.Next() {
        columnsData := make([]interface{}, len(columns))
        columnsPointers := make([]interface{}, len(columns))
        for i := range columnsData {
            columnsPointers[i] = &columnsData[i]
        }

        if err := rows.Scan(columnsPointers...); err != nil {
            return nil, fmt.Errorf("failed to scan row: %w", err)
        }

        rowMap := make(map[string]interface{})
        for i, colName := range columns {
            val := columnsPointers[i].(*interface{})
            rowMap[colName] = convertNullTypes(*val)
        }
        result = append(result, rowMap)
    }

    if err := rows.Err(); err != nil {
        return nil, fmt.Errorf("rows error: %w", err)
    }

    return result, nil
}

// convertNullTypes handles conversion of sql.Null* types to their corresponding Go types
func convertNullTypes(v interface{}) interface{} {
    if v == nil {
        return nil
    }

    switch v := v.(type) {
    case sql.NullString:
        if v.Valid {
            return v.String
        }
        return nil
    case sql.NullInt64:
        if v.Valid {
            return v.Int64
        }
        return nil
    case sql.NullFloat64:
        if v.Valid {
            return v.Float64
        }
        return nil
    case sql.NullBool:
        if v.Valid {
            return v.Bool
        }
        return nil
    case sql.NullTime:
        if v.Valid {
            return v.Time
        }
        return nil
    default:
        return v
    }
}

// ExecuteScyllaQueryRow executes a query on ScyllaDB and returns a single row as a map
func ExecuteScyllaQueryRow(query string, args ...interface{}) (map[string]interface{}, error) {
	// Ensure session is connected
	if session == nil {
		reconnect()
	}

	// Execute the query and get an iterator
	iter := session.Query(query, args...).Iter()
	defer iter.Close()

	// Prepare the map to store the row data
	row := make(map[string]interface{})
	if !iter.MapScan(row) {
		// If no rows were found, return an error
		return nil, gocql.ErrNotFound
	}

	// Check for errors in closing the iterator
	if err := iter.Close(); err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}

	// Return the row data
	return row, nil
}

// ExecutePostgresQueryRow executes a parameterized SQL query on PostgreSQL and returns a single row
func ExecutePostgresQueryRow(query string, args ...interface{}) (map[string]interface{}, error) {
    rows, err := ExecutePostgresQuery(query, args...)
    if err != nil {
        return nil, err
    }

    if len(rows) == 0 {
        return nil, sql.ErrNoRows
    }

    return rows[0], nil
}