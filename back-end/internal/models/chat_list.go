package models

import "time"

type Chatlist_Item struct {
	PartnerID     string `json:"partner_id"`
	PartnerName   string `json:"partner_name"`
	PartnerNumber string `json:"partner_number"`
	LastMessage   string `json:"last_message"`
	LastMessageAt string `json:"last_message_at"`
}

type ChatPartner struct {
	PartnerID     string
	LastMessage   string
	LastMessageAt time.Time
}
	