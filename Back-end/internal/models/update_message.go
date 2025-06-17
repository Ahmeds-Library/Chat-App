package models

type Update_Message struct {
	ID         string `json:"id" bson:"id"`
	New_Message string `json:"new_message" bson:"new_message"`
	Updated_At  string `json:"updated_at" bson:"updated_at"`
}
