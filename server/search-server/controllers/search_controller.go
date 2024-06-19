package controllers

import (
	"database/sql"

	// "fmt"
	"log"
	"strings"

	"net/http"
	"search-server/lib"
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
		log.Println("result")
		var result models.SearchResult

		// Check if the document type is user or package
		docType, found := hit.Fields["Type"]
		if !found {
			log.Printf("Warning: Field 'Type' not found for document ID %s\n", hit.ID)
			continue
		}

		if docTypeStr, ok := docType.(string); ok {
			if docTypeStr == "user" {
				// Map user fields
				result.Type = "user"
				result.UserName = getStringField(hit.Fields, "UserName")
				result.UserPublicToken = getStringField(hit.Fields, "UserPublicToken")
				result.Rating = getIntField(hit.Fields, "Rating")
				result.AccountType = getStringField(hit.Fields, "AccountType")
				result.Sport = getStringField(hit.Fields, "Sport")
				result.AccountDescription = getStringField(hit.Fields, "Description")
			} else if docTypeStr == "package" {
				// Map package fields
				result.Type = "package"
				result.PackageToken = getStringField(hit.Fields, "PackageToken")
				result.OwnerToken = getStringField(hit.Fields, "OwnerToken")
				result.PackageName = getStringField(hit.Fields, "PackageName")
				result.Sport = getStringField(hit.Fields, "PackageSport")
				result.Rating = getIntField(hit.Fields, "Rating")
			}
		} else {
			log.Printf("Warning: 'Type' field is not a valid string for document ID %s\n", hit.ID)
			continue
		}

		mappedResults = append(mappedResults, result)
	}

	// Return the search results in the response
	c.JSON(http.StatusOK, gin.H{"results": mappedResults})
}

// Helper function to safely get string fields from a document
func getStringField(fields map[string]interface{}, fieldName string) string {
	if field, found := fields[fieldName]; found {
		if str, ok := field.(string); ok {
			return str
		}
	}
	return ""
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

	var UserPublicToken = lib.GetPublicTokenByPrivateToken(user.UserPrivateToken, db)
	var rating = lib.GetAccountRating(UserPublicToken, db)

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

	var UserPublicToken = lib.GetPublicTokenByPrivateToken(user.UserPrivateToken, db)

	var rating = lib.GetAccountRating(UserPublicToken, db)

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

	var UserPublicToken = lib.GetPublicTokenByPrivateToken(user.UserPrivateToken, db)

	// First, remove the old document from the index.
	if err := index.Delete(UserPublicToken); err != nil {
		log.Fatal(err)
		c.JSON(http.StatusCreated, gin.H{"error": true})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"error": false})
}
