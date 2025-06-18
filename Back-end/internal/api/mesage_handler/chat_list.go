package message_handler

import (
	"context"
	"net/http"
	"time"

	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetChatListHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		claims, valid := utils.ValidateToken(c)
		if !valid {
			return
		}

		userID, ok := claims["id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": "User ID not found in token"})
			return
		}

		mongoClient, err := mongo_db.ConnectMongoDatabase()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to MongoDB", "details": err.Error()})
			return
		}
		collection := mongoClient.Database("Chat-App").Collection("messages")
		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.D{
				{Key: "$or", Value: bson.A{
					bson.D{{Key: "sender_id", Value: userID}},
					bson.D{{Key: "receiver_id", Value: userID}},
				}},
			}}},
			{{Key: "$project", Value: bson.D{
				{Key: "partner_id", Value: bson.D{
					{Key: "$cond", Value: bson.A{
						bson.D{{Key: "$eq", Value: bson.A{"$sender_id", userID}}},
						"$receiver_id",
						"$sender_id",
					}},
				}},
				{Key: "content", Value: "$content"},
				{Key: "created_at", Value: "$created_at"},
			}}},
			{{Key: "$sort", Value: bson.D{
				{Key: "created_at", Value: -1},
			}}},
			{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: "$partner_id"},
				{Key: "last_message", Value: bson.D{{Key: "$first", Value: "$content"}}},
				{Key: "last_message_at", Value: bson.D{{Key: "$first", Value: "$created_at"}}},
			}}},
			{{Key: "$sort", Value: bson.D{
				{Key: "last_message_at", Value: -1},
			}}},
		}

		cursor, err := collection.Aggregate(context.Background(), pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error at 71": err.Error()})
			return
		}
		defer cursor.Close(context.Background())

		var chatList []models.ChatListItem

		for cursor.Next(context.Background()) {
			var doc bson.M
			if err := cursor.Decode(&doc); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error decoding result": err.Error()})
				return
			}

			var partnerID string
			switch v := doc["_id"].(type) {
			case string:
				partnerID = v
			case primitive.ObjectID:
				partnerID = v.Hex()
			default:
				partnerID = ""
			}

			var lastMessage string
			if lm, ok := doc["last_message"].(string); ok {
				lastMessage = lm
			} else {
				lastMessage = ""
			}

			var lastMessageAt time.Time
			if lma, ok := doc["last_message_at"].(primitive.DateTime); ok {
				lastMessageAt = lma.Time()
			} else {
				lastMessageAt = time.Time{}
			}

			chatList = append(chatList, models.ChatListItem{
				PartnerID:     partnerID,
				LastMessage:   lastMessage,
				LastMessageAt: lastMessageAt,
			})
		}

		c.JSON(http.StatusOK, chatList)
	}
}
