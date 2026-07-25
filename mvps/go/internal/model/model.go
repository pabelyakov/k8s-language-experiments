package model

import (
	"time"

	"github.com/google/uuid"
)

type Beer struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type User struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type Vote struct {
	ID      uuid.UUID `json:"id"`
	UserID  uuid.UUID `json:"user_id"`
	BeerID  int       `json:"beer_id"`
	VotedAt time.Time `json:"voted_at"`
}

type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Runtime string `json:"runtime"`
}

type BeerListResponse struct {
	Items []Beer `json:"items"`
}

type CreateUserRequest struct {
	Name string `json:"name"`
}

type UserListResponse struct {
	Items      []User `json:"items"`
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
	Total      int    `json:"total"`
	TotalPages int    `json:"total_pages"`
}

type CreateVoteRequest struct {
	UserID uuid.UUID `json:"user_id"`
	BeerID int       `json:"beer_id"`
}

type VoteResponse struct {
	ID       uuid.UUID `json:"id"`
	UserID   uuid.UUID `json:"user_id"`
	BeerID   int       `json:"beer_id"`
	BeerName string    `json:"beer_name"`
	VotedAt  time.Time `json:"voted_at"`
}

type ResultItem struct {
	BeerID   int     `json:"beer_id"`
	BeerName string  `json:"beer_name"`
	Votes    int64   `json:"votes"`
	Share    float64 `json:"share"`
}

type ResultsResponse struct {
	TotalVotes int64        `json:"total_votes"`
	Results    []ResultItem `json:"results"`
}

type ErrorResponse struct {
	Error  string `json:"error"`
	Status int    `json:"status"`
}
