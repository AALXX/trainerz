package routes

import (
	"database/sql"
	"search-server/controllers"

	"github.com/blevesearch/bleve"

	"github.com/gin-gonic/gin"
)

func InitRoutes(router *gin.Engine, db *sql.DB, index bleve.Index) {
	userGroup := router.Group("/api")
	{
		userGroup.GET("/search/:search_query", func(c *gin.Context) {
			controllers.GetSerchedVideos(c, db, index)
		})

		userGroup.POST("/index-user", func(c *gin.Context) {
			controllers.AddToIndex(c, db, index)
		})

		userGroup.POST("/update-indexed-user", func(c *gin.Context) {
			controllers.UpdateIndexedUser(c, db, index)
		})

		userGroup.POST("/delete-indexed-user", func(c *gin.Context) {
			controllers.DeleteIndexedUser(c, db, index)
		})
	}
}
