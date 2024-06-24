package lib

import (
	"database/sql"

	"search-server/models"

	"github.com/blevesearch/bleve"
	_ "github.com/lib/pq"
)

func InitializeIndex() (bleve.Index, error) {
	// Create or open a Bleve index
	mapping := bleve.NewIndexMapping()
	index, err := bleve.Open("users_index")
	if err != nil {
		index, err = bleve.New("users_index", mapping)
		if err != nil {
			return nil, err
		}
	}
	return index, nil
}

func RetrieveUsersFromDB(db *sql.DB) ([]models.User, error) {
	rows, err := db.Query("SELECT u.UserName, u.Sport, u.UserPublicToken, u.AccountType, COALESCE(r.Rating, 0) AS Rating, Description FROM users u LEFT JOIN ratings r ON u.UserPublicToken = r.UserToken;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.UserName, &user.Sport, &user.UserPublicToken, &user.AccountType, &user.Rating, &user.Description); err != nil {
			return nil, err
		}
		user.Type = "user"

		if(user.AccountType == "Trainer"){
			users = append(users, user)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func RetrievePackagesFromDB(db *sql.DB) ([]models.Package, error) {
	rows, err := db.Query("SELECT PackageToken, OwnerToken, PackageName, PackageSport, Rating FROM Packages;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var packages []models.Package
	for rows.Next() {
		var pkg models.Package
		if err := rows.Scan(&pkg.PackageToken, &pkg.OwnerToken, &pkg.PackageName, &pkg.PackageSport, &pkg.Rating); err != nil {
			return nil, err
		}
		pkg.Type = "package"
		packages = append(packages, pkg)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return packages, nil
}

func IndexData(index bleve.Index, users []models.User, packages []models.Package) error {
	for _, user := range users {
		bleveDoc := map[string]interface{}{
			"UserName":        user.UserName,
			"UserPublicToken": user.UserPublicToken,
			"AccountType":     user.AccountType,
			"Rating":          user.Rating,
			"Sport":           user.Sport,
			"Description":     user.Description,
			"Type":            user.Type,
		}

		if err := index.Index(user.UserPublicToken, bleveDoc); err != nil {
			return err
		}
	}

	for _, pkg := range packages {
		bleveDoc := map[string]interface{}{
			"PackageToken": pkg.PackageToken,
			"OwnerToken":   pkg.OwnerToken,
			"PackageName":  pkg.PackageName,
			"PackageSport": pkg.PackageSport,
			"Rating":       pkg.Rating,
			"Type":         pkg.Type,
		}

		if err := index.Index(pkg.PackageToken, bleveDoc); err != nil {
			return err
		}
	}
	return nil
}

func GetPublicTokenByPrivateToken(PrivateToken string, db *sql.DB) string {
	rows, err := db.Query("SELECT UserPublicToken FROM users WHERE UserPrivateToken=?;", PrivateToken)
	if err != nil {
		return "error"
	}
	defer rows.Close()

	var userPublicToken string

	for rows.Next() {
		if err := rows.Scan(&userPublicToken); err != nil {
			return "error"
		}
	}

	if err := rows.Err(); err != nil {
		return "error"
	}

	return userPublicToken
}
func GetAccountRating(PublicToken string, db *sql.DB) int {
	rows, err := db.Query("select Rating from ratings WHERE UserToken=?;", PublicToken)
	if err != nil {
		return 0
	}
	defer rows.Close()

	var Rating int

	for rows.Next() {
		if err := rows.Scan(&Rating); err != nil {
			return 0
		}
	}

	if err := rows.Err(); err != nil {
		return 0
	}

	return Rating
}
