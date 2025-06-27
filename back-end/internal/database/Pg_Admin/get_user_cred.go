package pg_admin

import (
	"database/sql"
	"errors"
)

func GetUserCredentials(username string) (string, string, string, error) {
	var dbPassword, dbNumber, dbID string
	err := Db.QueryRow("SELECT password, number, id FROM users WHERE username = $1", username).Scan(&dbPassword, &dbNumber, &dbID)
	if err == sql.ErrNoRows {
		return "", "", "", errors.New("user not found")
	}
	if err != nil {
		return "", "", "", err
	}
	return dbPassword, dbNumber, dbID, nil
}
