package models

type Request_Message struct {
	Receiver_Number string `json:"receiver_number" bson:"receiver_number"`
	Message         string `json:"message" bson:"message"`
}
