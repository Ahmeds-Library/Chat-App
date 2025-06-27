package websocket_mongo

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/Ahmeds-Library/Chat-App/websocket_models"
	"github.com/Ahmeds-Library/Chat-App/websocket_utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MessageCollection *mongo.Collection

func ConnectMongoDatabase() error {
	websocket_utils.LoadEnv()

	MONGO_URI := os.Getenv("MONGO_URI")
	MONGO_DB := os.Getenv("MONGO_DB")

	if MONGO_URI == "" || MONGO_DB == "" {
		return errors.New(" MONGO_URI or MONGO_DB is missing in .env")
	}

	var client *mongo.Client
	var err error

	maxRetries := 10
	for attempt := 1; attempt <= maxRetries; attempt++ {
		clientOptions := options.Client().
			ApplyURI(MONGO_URI).
			SetConnectTimeout(5 * time.Second)

		client, err = mongo.Connect(context.Background(), clientOptions)
		if err == nil {
			err = client.Ping(context.Background(), nil)
			if err == nil {
				fmt.Println("Connected to MongoDB!")
				break
			}
		}

		fmt.Printf("⏳ MongoDB connection attempt %d/%d failed: %v\n", attempt, maxRetries, err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		return fmt.Errorf("mongo connection failed after %d attempts: %v", maxRetries, err)
	}

	MongoClient = client
	MessageCollection = client.Database(MONGO_DB).Collection("messages")
	return nil
}

func SaveMessage(msg *websocket_models.Save_Message) error {
	msg.ID = primitive.NewObjectID()
	msg.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := MessageCollection.InsertOne(ctx, msg)
	return err
}
