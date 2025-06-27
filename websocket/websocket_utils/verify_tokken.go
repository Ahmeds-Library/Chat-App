package websocket_utils

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

var SecretKey = []byte("secret-key")

func VerifyToken(tokenString string) error {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return SecretKey, nil
	})

	if err != nil {
		return err
	}

	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	return nil
}
