package models

import "gorm.io/gorm"

// Memo represents the structure for a memo in the database
type Memo struct {
	gorm.Model        // Includes fields like ID, CreatedAt, UpdatedAt, DeletedAt
	Title      string `gorm:"not null"`
	Content    string
}
