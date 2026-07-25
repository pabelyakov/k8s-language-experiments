package store

import (
	"cmp"
	"math"
	"slices"
	"sync"
	"time"

	"github.com/google/uuid"

	"beer-vote/internal/catalog"
	"beer-vote/internal/model"
)

type VoteStore struct {
	mu             sync.RWMutex
	votesByID      map[uuid.UUID]model.Vote
	voteIDByUserID map[uuid.UUID]uuid.UUID
	users          *UserStore
}

func NewVoteStore(users *UserStore) *VoteStore {
	return &VoteStore{
		votesByID:      make(map[uuid.UUID]model.Vote),
		voteIDByUserID: make(map[uuid.UUID]uuid.UUID),
		users:          users,
	}
}

func (s *VoteStore) Cast(userID uuid.UUID, beerID int) (model.VoteResponse, error) {
	if userID == uuid.Nil {
		return model.VoteResponse{}, &APIError{Status: 400, Message: "user_id is required"}
	}

	if !s.users.Exists(userID) {
		return model.VoteResponse{}, &APIError{Status: 404, Message: "user not found"}
	}

	beer, ok := catalog.FindByID(beerID)
	if !ok {
		return model.VoteResponse{}, &APIError{Status: 400, Message: "beer_id must be one of the nominees (1..10)"}
	}

	vote := model.Vote{
		ID:      uuid.New(),
		UserID:  userID,
		BeerID:  beer.ID,
		VotedAt: time.Now().UTC(),
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.voteIDByUserID[userID]; exists {
		return model.VoteResponse{}, &APIError{Status: 409, Message: "user has already voted"}
	}

	s.voteIDByUserID[userID] = vote.ID
	s.votesByID[vote.ID] = vote

	return model.VoteResponse{
		ID:       vote.ID,
		UserID:   vote.UserID,
		BeerID:   vote.BeerID,
		BeerName: beer.Name,
		VotedAt:  vote.VotedAt,
	}, nil
}

func (s *VoteStore) Results() model.ResultsResponse {
	beers := catalog.All()
	counts := make(map[int]int64, len(beers))
	for _, beer := range beers {
		counts[beer.ID] = 0
	}

	s.mu.RLock()
	totalVotes := int64(len(s.votesByID))
	for _, vote := range s.votesByID {
		counts[vote.BeerID]++
	}
	s.mu.RUnlock()

	results := make([]model.ResultItem, 0, len(beers))
	for _, beer := range beers {
		votes := counts[beer.ID]
		share := 0.0
		if totalVotes > 0 {
			share = math.Round((float64(votes)/float64(totalVotes))*10000) / 10000
		}
		results = append(results, model.ResultItem{
			BeerID:   beer.ID,
			BeerName: beer.Name,
			Votes:    votes,
			Share:    share,
		})
	}

	slices.SortFunc(results, func(a, b model.ResultItem) int {
		if c := cmp.Compare(b.Votes, a.Votes); c != 0 {
			return c
		}
		return cmp.Compare(a.BeerID, b.BeerID)
	})

	return model.ResultsResponse{
		TotalVotes: totalVotes,
		Results:    results,
	}
}
