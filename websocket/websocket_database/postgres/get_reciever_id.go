package websocket_postgres

import (
	"database/sql"
	"errors"

	"github.com/Ahmeds-Library/Chat-App/websocket_models"
)

func InitDB(dataSourceName string) error {
	var err error
	Db, err = sql.Open("postgres", dataSourceName)
	if err != nil {
		return err
	}
	return Db.Ping()
}

func GetUserByPhone(phone string) (*websocket_models.User, error) {
	var user websocket_models.User
	row := Db.QueryRow("SELECT id, username, number FROM users WHERE number=$1", phone)
	if err := row.Scan(&user.ID, &user.Username, &user.Number); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}
