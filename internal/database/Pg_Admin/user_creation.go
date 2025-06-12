package pg_admin

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func CreateUser(username, password, number string) error {

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	_, err = Db.Exec("INSERT INTO users (username, password, number) VALUES ($1, $2, $3)", username, string(hashedPassword), number)
	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") {
			return errors.New("username already exists")
		}
		return err
	}
	return nil
}
