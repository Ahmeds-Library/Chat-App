package auth

import (
	"time"

	"github.com/golang-jwt/jwt"
)

func Create_Refresh_Token(id, username, number string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS512,
		jwt.MapClaims{
			"id":       id,
			"username": username,
			"number":   number,
			"token_type": "refresh",
			"exp":      time.Now().Add(time.Hour * 24 *7).Unix(),
		})

	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}	

func Create_Access_Token(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS512,
		jwt.MapClaims{
			"id": id,
			"token_type": "Access",
			"exp": time.Now().Add(time.Minute * 10).Unix(),
		})

	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

