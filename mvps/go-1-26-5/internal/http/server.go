package httpserver

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"beer-vote/internal/catalog"
	"beer-vote/internal/model"
	"beer-vote/internal/store"
)

type Server struct {
	users *store.UserStore
	votes *store.VoteStore
}

func New(users *store.UserStore, votes *store.VoteStore) http.Handler {
	s := &Server{users: users, votes: votes}
	r := chi.NewRouter()

	r.Get("/health", s.handleHealth)
	r.Get("/v1/beers", s.handleListBeers)
	r.Post("/v1/users", s.handleCreateUser)
	r.Get("/v1/users", s.handleListUsers)
	r.Post("/v1/votes", s.handleCreateVote)
	r.Get("/v1/results", s.handleResults)

	return r
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, model.HealthResponse{
		Status:  "ok",
		Service: "beer-vote",
		Runtime: "go-1-26-5",
	})
}

func (s *Server) handleListBeers(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, model.BeerListResponse{Items: catalog.All()})
}

func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req model.CreateUserRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := s.users.Create(req.Name)
	if err != nil {
		writeAPIError(w, err)
		return
	}

	w.Header().Set("Location", "/v1/users/"+user.ID.String())
	writeJSON(w, http.StatusCreated, user)
}

func (s *Server) handleListUsers(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	page := 1
	if raw := q.Get("page"); raw != "" {
		v, err := strconv.Atoi(raw)
		if err != nil {
			writeError(w, http.StatusBadRequest, "page must be >= 1")
			return
		}
		page = v
	}

	pageSize := 20
	if raw := q.Get("page_size"); raw != "" {
		v, err := strconv.Atoi(raw)
		if err != nil {
			writeError(w, http.StatusBadRequest, "page_size must be 1..100")
			return
		}
		pageSize = v
	}

	sort := q.Get("sort")
	if sort == "" {
		sort = "created_at"
	}
	order := q.Get("order")
	if order == "" {
		order = "desc"
	}

	resp, err := s.users.List(page, pageSize, sort, order)
	if err != nil {
		writeAPIError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) handleCreateVote(w http.ResponseWriter, r *http.Request) {
	var req model.CreateVoteRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	vote, err := s.votes.Cast(req.UserID, req.BeerID)
	if err != nil {
		writeAPIError(w, err)
		return
	}

	w.Header().Set("Location", "/v1/votes/"+vote.ID.String())
	writeJSON(w, http.StatusCreated, vote)
}

func (s *Server) handleResults(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.votes.Results())
}

func decodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return errors.New("invalid JSON body")
	}
	return nil
}

func writeAPIError(w http.ResponseWriter, err error) {
	var apiErr *store.APIError
	if errors.As(err, &apiErr) {
		writeError(w, apiErr.Status, apiErr.Message)
		return
	}
	writeError(w, http.StatusInternalServerError, "internal server error")
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, model.ErrorResponse{Error: message, Status: status})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	_ = enc.Encode(v)
}
