package models

type User struct {
	ID	   string `json:"id,omitempty"`
	Username string `json:"username"`
	Password string `json:"password"`
	Number   string `json:"number"`
}
