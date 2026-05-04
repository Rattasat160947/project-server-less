package main

import (
"database/sql"
"encoding/json"
"fmt"
"log"
"net/http"
"os"

"github.com/joho/godotenv"
"github.com/prometheus/client_golang/prometheus"
"github.com/prometheus/client_golang/prometheus/promhttp"
_ "modernc.org/sqlite"
)

var checkInCounter = prometheus.NewCounter(
prometheus.CounterOpts{
Name: "student_checkin_total",
Help: "Total number of students checked in",
},
)

var db *sql.DB

func init() {
	prometheus.MustRegister(checkInCounter)
}

type CheckinRequest struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			return
		}

		next(w, r)
	}
}

func checkinHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var req CheckinRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}

		// Insert into SQLite
		_, err := db.Exec("INSERT INTO checkins (student_id, name) VALUES (?, ?)", req.ID, req.Name)
		if err != nil {
			http.Error(w, "Failed to save to database", http.StatusInternalServerError)
			log.Printf("DB insert error: %v", err)
			return
		}

		checkInCounter.Inc()
		fmt.Fprint(w, "บันทึกสำเร็จ")
		return
	}
	http.Error(w, "Invalid request", http.StatusMethodNotAllowed)
}

func initDB(dbPath string) {
	var err error
	db, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS checkins (
id INTEGER PRIMARY KEY AUTOINCREMENT,
student_id TEXT NOT NULL,
name TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
}

func main() {
	// Try loading .env from root or current dir
	err := godotenv.Load("../.env")
	if err != nil {
		godotenv.Load(".env")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "app.db"
	}
	
	initDB(dbPath)

	http.HandleFunc("/api/checkin", enableCORS(checkinHandler))
	http.Handle("/metrics", promhttp.Handler())

	fmt.Printf("Server starting on :%s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
