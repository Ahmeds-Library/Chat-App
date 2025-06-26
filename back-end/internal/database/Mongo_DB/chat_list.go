package mongo_db

import (
	"context"
	"time"

	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetChatPartners(db *mongo.Database, userID string) ([]models.ChatPartner, error) {
	collection := db.Collection("messages")

	filter := bson.M{
		"$or": bson.A{
			bson.M{"sender_id": userID},
			bson.M{"receiver_id": userID},
		},
	}
		
	findOptions := options.Find().SetSort(bson.M{"created_at": -1})

	cursor, err := collection.Find(context.Background(), filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var chatList []models.ChatPartner

	for cursor.Next(context.Background()) {
		var message struct {
			SenderID   string    `bson:"sender_id"`
			ReceiverID string    `bson:"receiver_id"`
			Message    string    `bson:"message"`
			CreatedAt  time.Time `bson:"created_at"`
		}

		if err := cursor.Decode(&message); err != nil {
			return nil, err
		}

		var partnerID string
		if message.SenderID == userID {
			partnerID = message.ReceiverID
		} else {
			partnerID = message.SenderID
		}

		chatList = append(chatList, models.ChatPartner{
			PartnerID:     partnerID,
			LastMessage:   message.Message,
			LastMessageAt: message.CreatedAt,
		})
	}

	return chatList, nil
}
