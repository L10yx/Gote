package main

import (
	"log"
	"net/http"
	"strconv"

	"gote/backend/database"
	"gote/backend/models"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Backend starting...")

	// Connect to the database
	database.ConnectDB()

	// Initialize Gin router
	r := gin.Default()

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/memos", getMemosHandler)
		api.POST("/memos", createMemoHandler)
		api.GET("/memos/:id", getMemoHandler)
		api.PUT("/memos/:id", updateMemoHandler)
		api.DELETE("/memos/:id", deleteMemoHandler)
	}

	// Start the server
	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

// --- Handler Functions ---

// getMemosHandler retrieves all memos
func getMemosHandler(c *gin.Context) {
	var memos []models.Memo
	if result := database.DB.Find(&memos); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve memos"})
		return
	}
	c.JSON(http.StatusOK, memos)
}

// createMemoHandler creates a new memo
func createMemoHandler(c *gin.Context) {
	var newMemo models.Memo
	if err := c.ShouldBindJSON(&newMemo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if result := database.DB.Create(&newMemo); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create memo"})
		return
	}
	c.JSON(http.StatusCreated, newMemo)
}

// getMemoHandler retrieves a specific memo by ID
func getMemoHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid memo ID"})
		return
	}

	var memo models.Memo
	if result := database.DB.First(&memo, uint(id)); result.Error != nil {
		if result.Error.Error() == "record not found" { // Use gorm.ErrRecordNotFound in production
			c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve memo"})
		}
		return
	}
	c.JSON(http.StatusOK, memo)
}

// updateMemoHandler updates a specific memo by ID
func updateMemoHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid memo ID"})
		return
	}

	var memo models.Memo
	if result := database.DB.First(&memo, uint(id)); result.Error != nil {
		if result.Error.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve memo for update"})
		}
		return
	}

	var updatedMemo models.Memo
	if err := c.ShouldBindJSON(&updatedMemo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	memo.Title = updatedMemo.Title
	memo.Content = updatedMemo.Content

	if result := database.DB.Save(&memo); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update memo"})
		return
	}
	c.JSON(http.StatusOK, memo)
}

// deleteMemoHandler deletes a specific memo by ID
func deleteMemoHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid memo ID"})
		return
	}

	if result := database.DB.Delete(&models.Memo{}, uint(id)); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete memo"})
		return
	} else if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Memo deleted successfully"})
}
