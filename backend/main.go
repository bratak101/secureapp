package main

import (
	"log"
	"net/http"
	"os"

	"secure-app/backend/internal/database"
	"secure-app/backend/internal/handlers"
	"secure-app/backend/internal/middleware"
)

func main() {
	if err := database.Init(); err != nil {
		log.Fatalf("Database: %v", err)
	}
	defer database.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/register", middleware.RateLimit(handlers.Register))
	mux.HandleFunc("/login", middleware.RateLimit(handlers.Login))

	handler := middleware.CORS(mux)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("Backend listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}
