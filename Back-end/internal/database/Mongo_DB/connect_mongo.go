package mongo_db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongoDatabase() (*mongo.Client, error) {

	utils.LoadEnvVariables()

	MONGO_URI := os.Getenv("MONGO_URI")

	clientOptions := options.Client().ApplyURI(MONGO_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	} 

	fmt.Println("Connected to mongoDB!!!")
	fmt.Println("Mongo_URI:", MONGO_URI)

	return client, nil

}

