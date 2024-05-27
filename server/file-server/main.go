package main

import (
	"database/sql"
	"file-server/config"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

    "github.com/joho/godotenv"
	"github.com/fsnotify/fsnotify"
)

var (
	cacheLock sync.Mutex
	fileCache = make(map[string][]byte)
)

func safeFileServer(dir string, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Ensure the requested path is safe.
		// requestedPath := filepath.Join(dir, filepath.Clean(privateToken + r.URL.Query().Get("vt") + r.URL.Query().Get("f")))
		requestedPath := filepath.Join(dir, filepath.Clean(r.URL.Path))

		if !strings.HasPrefix(requestedPath, dir) {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}

		// Check if the requested file exists.
		fileInfo, err := os.Stat(requestedPath)
		if os.IsNotExist(err) {
			http.ServeFile(w, r, "./AccountIcon.svg")

			return
		}

		// Ensure the requested path is a file (not a directory).
		if fileInfo.IsDir() {
			http.Error(w, "Not a File", http.StatusForbidden)
			return
		}

		// Serve the file using the built-in FileServer.
		http.ServeFile(w, r, requestedPath)
	})
}

func resetCache() {
	cacheLock.Lock()
	defer cacheLock.Unlock()
	fileCache = make(map[string][]byte)
}

func restrictIP(next http.Handler, allowedIP string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		remoteAddr := r.RemoteAddr
		log.Printf("remote address %s\n", remoteAddr)

		if remoteAddr != allowedIP {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func watchFiles(dir string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	// Watch for changes in the directory.
	err = filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		return watcher.Add(path)
	})
	if err != nil {
		log.Fatal(err)
	}

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				log.Println("File modified:", event.Name)
				resetCache() // Reset the cache when a file is modified.

			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("Error:", err)
		}
	}
}

func main() {
	// Load the environment variables from the .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

	// Initialize the database connection
	db, err := config.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Define the directory from which to serve files.
	dir := "../accounts" // Change this to your desired directory.

	// Create a file server handler.
	fileServer := safeFileServer(dir, db)

	// Start a goroutine to watch for changes in the served directory.
	// go watchFiles(dir)


	// Create a router and register the file server.
	// mux := http.NewServeMux()
	// mux.Handle("/", restrictIP(fileServer, "192.168.72.81")) // Replace with your allowed IP address.
	http.Handle("/", fileServer)

	// Define the server address and port.
	addr := "192.168.72.81:5600"

	log.Printf("Server started on %s\n", addr)
	// Start the HTTP server.
	if err := http.ListenAndServe(addr, nil); err != nil {
		panic(err)
	}

}
