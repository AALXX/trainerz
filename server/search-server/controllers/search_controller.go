package controllers

import (
	"database/sql"

	// "fmt"
	"log"
	"strings"

	"net/http"
	"search-server/config"
	"search-server/models"

	"github.com/blevesearch/bleve"

	"github.com/gin-gonic/gin"
)

func SearchIndex(c *gin.Context, db *sql.DB, index bleve.Index) {
	search_query := c.Param("search_query")

	// Split the search query into terms
	terms := strings.Fields(search_query)

	// Create a Boolean query with OR clauses for each term
	boolQuery := bleve.NewBooleanQuery()
	for _, term := range terms {
		fuzzyQuery := bleve.NewFuzzyQuery(term)
		boolQuery.AddShould(fuzzyQuery)
		fuzzyQuery.SetFuzziness(2)
	}

	searchRequest := bleve.NewSearchRequest(boolQuery)
	searchRequest.Fields = []string{"*"} // Specify the field to return *= everything
	searchRequest.Highlight = bleve.NewHighlight()
	searchResults, err := index.Search(searchRequest)

	if err != nil {
		log.Fatal(err)
	}

	// Map search results into an array
	var mappedResults []models.SearchResult
	for _, hit := range searchResults.Hits {
		var result models.SearchResult

		// Check if the document type is user or package
		docType := hit.Fields["Type"].(string)
		if docType == "user" {
			// Map user fields
			result.Type = "user"
			result.UserName = hit.Fields["UserName"].(string)
			result.UserPublicToken = hit.Fields["UserPublicToken"].(string)
			result.Rating = 0
			result.AccountType = hit.Fields["AccountType"].(string)
			result.Sport = hit.Fields["Sport"].(string)
			result.AccountDescription = hit.Fields["Description"].(string)
			result.Rating = getIntField(hit.Fields, "Rating")

		} else if docType == "package" {
			// Map package fields
			result.Type = "package"
			result.PackageToken = hit.Fields["PackageToken"].(string)
			result.OwnerToken = hit.Fields["OwnerToken"].(string)
			result.PackageName = hit.Fields["PackageName"].(string)
			result.PackageSport = hit.Fields["PackageSport"].(string)
			result.Rating = getIntField(hit.Fields, "Rating")

		}

		mappedResults = append(mappedResults, result)
	}

	// Return the search results in the response
	c.JSON(http.StatusOK, gin.H{"results": mappedResults})
}

// Helper function to safely get int fields from a document
func getIntField(fields map[string]interface{}, fieldName string) int {
	if field, found := fields[fieldName]; found {
		switch v := field.(type) {
		case int:
			return v
		case float64:
			return int(v)
		}
	}
	return 0
}

func AddToIndex(c *gin.Context, db *sql.DB, index bleve.Index) {

	var user models.UserReq
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "msg": err.Error()})
		return
	}

	var UserPublicToken = config.GetPublicTokenByPrivateToken(user.UserPrivateToken, db)
	var rating = config.GetAccountRating(UserPublicToken, db)

	newUser := models.User{
		UserName:        user.UserName,
		UserPublicToken: UserPublicToken,
		Rating:          rating,
		Sport:           user.Sport,
		AccountType:     user.AccountType,
	}

	if err := index.Index(UserPublicToken, newUser); err != nil {
		log.Fatal(err)
		c.JSON(http.StatusCreated, gin.H{"error": true})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"error": false})
}

func UpdateIndexedUser(c *gin.Context, db *sql.DB, index bleve.Index) {

	var user models.UserReq
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "msg": err.Error()})
		return
	}

	var UserPublicToken = config.GetPublicTokenByPrivateToken(user.UserPrivateToken, db)

	var rating = config.GetAccountRating(UserPublicToken, db)

	newUser := models.User{
		UserName:        user.UserName,
		UserPublicToken: UserPublicToken,
		Rating:          rating,
		Sport:           user.Sport,
		AccountType:     user.AccountType,
	}

	// First, remove the old document from the index.
	if err := index.Delete(UserPublicToken); err != nil {
		log.Fatal(err)
		c.JSON(http.StatusCreated, gin.H{"error": true})
		return
	}

	if err := index.Index(UserPublicToken, newUser); err != nil {
		log.Fatal(err)
		c.JSON(http.StatusCreated, gin.H{"error": true})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"error": false})
}

func DeleteIndexedUser(c *gin.Context, db *sql.DB, index bleve.Index) {

	var user models.UserReq
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "msg": err.Error()})
		return
	}

	var UserPublicToken = config.GetPublicTokenByPrivateToken(user.UserPrivateToken, db)

	// First, remove the old document from the index.
	if err := index.Delete(UserPublicToken); err != nil {
		log.Fatal(err)
		c.JSON(http.StatusCreated, gin.H{"error": true})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"error": false})
}
