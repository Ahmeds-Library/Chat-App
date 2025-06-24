package mongo_db

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

func ConnectMongoDatabase() error {
	utils.LoadEnvVariables()

	MONGO_URI := os.Getenv("MONGO_URI")

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
	return nil 
}
