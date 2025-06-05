package pg_admin

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/Ahmeds-Library/Chat-App/internal/models"
)

func InitDB(dataSourceName string) error {
	var err error
	Db, err = sql.Open("postgres", dataSourceName)
	if err != nil {
		return err
	}
	return Db.Ping()
}

func GetUserByPhone(phone string) (*models.User, error) {
	fmt.Println("phone:", phone)
	var user models.User
	row := Db.QueryRow("SELECT id, username, number FROM users WHERE number=$1", phone)
	if err := row.Scan(&user.ID, &user.Username, &user.Number); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			fmt.Println(err, "25")
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func TestGetUserByPhone(phone string) {
	user, err := GetUserByPhone(phone)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("User found: ID=%s, Username=%s, Number=%s\n", user.ID, user.Username, user.Number)
	}
}
