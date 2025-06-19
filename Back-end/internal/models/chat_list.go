package models

import "time"

type ChatListItem struct {
	PartnerID     string    `json:"partner_id"`
	LastMessage   string    `json:"last_message"`
	LastMessageAt time.Time `json:"last_message_at"`
}
