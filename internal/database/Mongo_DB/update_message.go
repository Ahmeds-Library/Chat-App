package mongo_db

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func Update_Message(db *mongo.Database, messageID, senderID, newMessage string, updatedTime time.Time) error {
	collection := db.Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(messageID)
	if err != nil {
		return errors.New("invalid message ID format")
	}

	filter := bson.M{
		"_id":       objID,
		"sender_id": senderID,
	}

	update := bson.M{
		"$set": bson.M{
			"message":      newMessage,
			"edited":       true,
			"updated_time": updatedTime,
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var messages []bson.M
	if err = cursor.All(ctx, &messages); err != nil {
		return err
	}

	if len(messages) == 0 {
		return errors.New("no matching message found or unauthorized")
	}

	for range messages {
		if _, err := collection.UpdateOne(ctx, filter, update); err != nil {
			return err
		}
	}

	return nil
}

msg