package utils

import (
	"context"
	"fmt"
	"log"

	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func Message_Fetcher(mongoClient *mongo.Client, senderID, receiverID string) ([]models.Save_Message, error) {
	collection := mongoClient.Database("chat-app").Collection("messages")

	filter := bson.M{
		"$or": []bson.M{
			{"sender_id": senderID, "receiver_id": receiverID},
			{"sender_id": receiverID, "receiver_id": senderID},
		},
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		log.Println("Error finding messages:", err)
		return nil, err
	}
	defer cursor.Close(context.Background())

	var messages []models.Save_Message
	for cursor.Next(context.Background()) {
		var msg models.Save_Message
		if err := cursor.Decode(&msg); err != nil {
			log.Println("Error decoding message:", err)
			return nil, err
		}
		messages = append(messages, msg)
	}

	if len(messages) == 0 {
		return nil, fmt.Errorf("no messages found")
	}

	return messages, nil
}
