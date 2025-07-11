package websocket_models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Save_Message struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	SenderID   string             `bson:"sender_id" json:"sender_id"`
	ReceiverID string             `bson:"receiver_id" json:"receiver_id"`
	Message    string             `bson:"message" json:"message"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
