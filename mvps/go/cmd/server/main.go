package main

import (
	"log"
	"net/http"

	httpserver "beer-vote/internal/http"
	"beer-vote/internal/store"
)

func main() {
	users := store.NewUserStore()
	votes := store.NewVoteStore(users)

	addr := "0.0.0.0:8080"
	log.Printf("beer-vote listening on http://%s", addr)
	if err := http.ListenAndServe(addr, httpserver.New(users, votes)); err != nil {
		log.Fatal(err)
	}
}
