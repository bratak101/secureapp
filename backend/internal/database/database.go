package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

// DB globalna pula połączeń (Prepared Statements używają jej wewnętrznie).
var DB *sql.DB

// DSN – obsługuje DB_* oraz Railway (MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE).
func dsn() string {
	user := os.Getenv("DB_USER")
	if user == "" {
		user = os.Getenv("MYSQLUSER")
	}
	if user == "" {
		user = "root"
	}
	pass := os.Getenv("DB_PASS")
	if pass == "" {
		pass = os.Getenv("MYSQLPASSWORD")
	}
	host := os.Getenv("DB_HOST")
	if host == "" {
		h := os.Getenv("MYSQLHOST")
		p := os.Getenv("MYSQLPORT")
		if h != "" && p != "" {
			host = h + ":" + p
		} else if h != "" {
			host = h + ":3306"
		}
	}
	if host == "" {
		host = "127.0.0.1:3306"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = os.Getenv("MYSQLDATABASE")
	}
	if dbname == "" {
		dbname = "secure_app"
	}
	return fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true&charset=utf8mb4", user, pass, host, dbname)
}

// Init łączy z MySQL i weryfikuje połączenie.
func Init() error {
	var err error
	DB, err = sql.Open("mysql", dsn())
	if err != nil {
		return err
	}
	if err = DB.Ping(); err != nil {
		return err
	}
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	return nil
}

// Close zamyka pulę połączeń.
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
