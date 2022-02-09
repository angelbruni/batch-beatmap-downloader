package database

import (
	"database/sql"
	"os"

	"github.com/joho/godotenv"
)

func open() {
	godotenv.Load()
	database, _ = sql.Open("sqlite3", os.Getenv("DB_LOCATION"))
	database.SetMaxOpenConns(1)
}

func Close() {
	database.Close()
}
