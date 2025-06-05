package models

type Request_Message struct {
	Receiver_Number string `json:"receiver_phone"`
    Message         string `json:"content"`
}
