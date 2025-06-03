package database

import (
	"database/sql"
	"errors"
)

func GetUserCredentials(username string) (string, string, error) {
	var dbPassword, dbID string
	err := Db.QueryRow("SELECT password, id FROM users WHERE username = $1", username).Scan(&dbPassword, &dbID)
	if err == sql.ErrNoRows {
		return "", "", errors.New("user not found")
	}
	if err != nil {
		return "", "", err
	}
	return dbPassword, dbID, nil
}
