package services

import (
	"time"

	"github.com/golang-jwt/jwt"
)

func CreateToken(id, username, number string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS512,
		jwt.MapClaims{
			"id":       id,
			"username": username,
			"number":   number,
			"exp":      time.Now().Add(time.Minute * 30).Unix(),
		})

	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
