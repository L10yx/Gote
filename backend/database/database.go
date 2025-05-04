package database

import (
	"fmt"
	"log"
	"os"

	"gote/backend/models" // Import the models package

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the database connection instance
var DB *gorm.DB

// ConnectDB connects to the database and performs auto-migration
func ConnectDB() {
	var err error
	// Use a file named gote.db in the current directory
	dsn := "gote.db"
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Log SQL queries
	})

	if err != nil {
		log.Fatal("Failed to connect to database! \n", err)
		os.Exit(2)
	}

	log.Println("Connected to database successfully")
	DB.Logger = logger.Default.LogMode(logger.Info)

	log.Println("Running Migrations")
	// Auto-migrate the Memo model
	err = DB.AutoMigrate(&models.Memo{})
	if err != nil {
		log.Fatal("Failed to migrate database! \n", err)
		os.Exit(2)
	}

	fmt.Println("Database Migrated")
}
