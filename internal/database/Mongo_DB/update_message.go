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

    var oldMsg bson.M
    err = collection.FindOne(ctx, filter).Decode(&oldMsg)
    if err != nil {
        return errors.New("no matching message found or unauthorized")
    }

    updateDoc := bson.M{
        "$set": bson.M{
            "message":      newMessage,
            "edited":       true,
            "updated_time": updatedTime,
        },
    }
    _, err = collection.UpdateOne(ctx, filter, updateDoc)
    if err != nil {
        return err
    }

    return nil
}