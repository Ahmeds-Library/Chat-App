package models

import "time"

type Message struct {
    SenderID   string    `bson:"sender_id" json:"sender_id"`
    ReceiverID string    `bson:"receiver_id" json:"receiver_id"`
    Content    string    `bson:"content" json:"content"`
    CreatedAt  time.Time `bson:"created_at" json:"created_at"`
}

