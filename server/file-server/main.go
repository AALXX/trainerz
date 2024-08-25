package main

import (
	"context"
	"crypto/subtle"
	"database/sql"
	"file-server/config"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"github.com/rs/cors"

)

var (
	cacheLock sync.RWMutex
	fileCache = make(map[string]cachedFile)
)

type cachedFile struct {
	content   []byte
	timestamp time.Time
}

func safeFileServer(dir string, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		requestedPath := filepath.Join(dir, filepath.Clean(r.URL.Path))

		if !strings.HasPrefix(requestedPath, dir) {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}

		cacheLock.RLock()
		cachedContent, exists := fileCache[requestedPath]
		cacheLock.RUnlock()

		if exists {
			fileInfo, err := os.Stat(requestedPath)
			if err == nil && fileInfo.ModTime().Before(cachedContent.timestamp) {
				w.Header().Set("Content-Type", http.DetectContentType(cachedContent.content))
				w.Write(cachedContent.content)
				return
			}
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

		content, err := os.ReadFile(requestedPath)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		cacheLock.Lock()
		fileCache[requestedPath] = cachedFile{content: content, timestamp: time.Now()}
		cacheLock.Unlock()

		w.Header().Set("Content-Type", http.DetectContentType(content))
		w.Write(content)
	})
}

func resetCache() {
	cacheLock.Lock()
	defer cacheLock.Unlock()
	fileCache = make(map[string]cachedFile)
}

func restrictIP(next http.Handler, allowedIPs []string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		remoteIP := strings.Split(r.RemoteAddr, ":")[0]
		// log.Printf("Remote address: %s\n", remoteIP)

		allowed := false
		for _, ip := range allowedIPs {
			if remoteIP == ip {
				allowed = true
				break
			}
		}

		if !allowed {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func watchFiles(ctx context.Context, dir string) {
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
		case <-ctx.Done():
			return
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				// log.Println("File modified:", event.Name)
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

func basicAuth(next http.Handler, username, password string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, pass, ok := r.BasicAuth()

		if !ok || subtle.ConstantTimeCompare([]byte(user), []byte(username)) != 1 || bcrypt.CompareHashAndPassword([]byte(password), []byte(pass)) != nil {
			w.Header().Set("WWW-Authenticate", `Basic realm="restricted", charset="UTF-8"`)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	serverHost := os.Getenv("SERVER_HOST")
	if serverHost == "" {
		log.Fatalf("SERVER_HOST environment variable not set")
	}

	allowedIPs := strings.Split(os.Getenv("ALLOWED_IPS"), ",")
	username := os.Getenv("AUTH_USERNAME")
	password := os.Getenv("AUTH_PASSWORD")

	if username == "" || password == "" {
		log.Fatalf("AUTH_USERNAME and AUTH_PASSWORD must be set")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Error hashing password: %v", err)
	}

	db, err := config.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	dir := "../accounts"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go watchFiles(ctx, dir)

	fileServer := safeFileServer(dir, db)
	
	mux := http.NewServeMux()
	mux.Handle("/", fileServer)

	handler := restrictIP(basicAuth(mux, username, string(hashedPassword)), allowedIPs)

	// Create a CORS middleware
	c := cors.New(cors.Options{
	    AllowedOrigins: []string{"http://localhost:3000"},  // Be more specific in production
	    AllowedMethods: []string{"GET", "HEAD", "POST", "OPTIONS"},
	    AllowedHeaders: []string{"Authorization", "Content-Type"},
	    AllowCredentials: true,
	})

	corsHandler := c.Handler(handler)


	server := &http.Server{
		Addr:         serverHost,
		Handler:      corsHandler,  // Use the CORS-enabled handler
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("Serving files from:", serverHost)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error starting server: %v", err)
	}
}