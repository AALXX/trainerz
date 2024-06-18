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

	"github.com/fsnotify/fsnotify"
	"github.com/joho/godotenv"
)

var (
	cacheLock sync.Mutex
	fileCache = make(map[string][]byte)
)

func safeFileServer(dir string, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestedPath := filepath.Join(dir, filepath.Clean(r.URL.Path))

		if !strings.HasPrefix(requestedPath, dir) {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}

		fileInfo, err := os.Stat(requestedPath)
		if os.IsNotExist(err) {
			http.ServeFile(w, r, "./AccountIcon.svg")
			return
		}

		if fileInfo.IsDir() {
			http.Error(w, "Not a File", http.StatusForbidden)
			return
		}

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
				resetCache()
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
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	serverHost := os.Getenv("SERVER_HOST")
	if serverHost == "" {
		log.Fatalf("SERVER_HOST environment variable not set")
	}

	db, err := config.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	dir := "../accounts"

	fileServer := safeFileServer(dir, db)
	
	mux := http.NewServeMux()
	mux.Handle("/", fileServer)

	log.Println("Serving files from:", serverHost)
	if err := http.ListenAndServe(serverHost, mux); err != nil {
		panic(err)
	}
}