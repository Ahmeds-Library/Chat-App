package pg_admin

import (
	"database/sql"
	"errors"
	"strconv"

	"github.com/Ahmeds-Library/Chat-App/internal/models"
)

func GetDataFromID(userID string) (*models.User, error) {
	if userID == "" {
		return nil, errors.New("empty userID")
	}

	idInt, err := strconv.Atoi(userID)
	if err != nil {
		return nil, errors.New("invalid userID format: " + userID)
	}

	var user models.User
	row := Db.QueryRow("SELECT id, username, number FROM users WHERE id=$1", idInt)
	if err := row.Scan(&user.ID, &user.Username, &user.Number); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}
