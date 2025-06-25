package wc_database

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/Ahmeds-Library/Chat-App/wc_models"
	"github.com/Ahmeds-Library/Chat-App/wc_utils"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MessageCollection *mongo.Collection

func ConnectMongoDatabase() error {
	wc_utils.LoadEnv()

	MONGO_URI := os.Getenv("MONGO_URI")
	MONGO_DB := os.Getenv("MONGO_DB")

	if MONGO_URI == "" || MONGO_DB == "" {
		return errors.New("❌ MONGO_URI or MONGO_DB is missing in .env")
	}

	clientOptions := options.Client().
		ApplyURI(MONGO_URI).
		SetConnectTimeout(10 * time.Second)

	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return err
	}

	err = client.Ping(context.Background(), nil)
	if err != nil {
		return err
	}

	fmt.Println("✅ Connected to MongoDB!")

	MongoClient = client
	MessageCollection = client.Database(MONGO_DB).Collection("messages")
	return nil
}
func SaveMessage(msg *wc_models.Save_Message) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := MessageCollection.InsertOne(ctx, msg)
	return err
}
