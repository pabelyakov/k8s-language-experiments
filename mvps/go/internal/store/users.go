package store

import (
	"cmp"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"beer-vote/internal/model"
)

type UserStore struct {
	mu    sync.RWMutex
	users map[uuid.UUID]model.User
}

func NewUserStore() *UserStore {
	return &UserStore{
		users: make(map[uuid.UUID]model.User),
	}
}

func (s *UserStore) Create(name string) (model.User, error) {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" || len(trimmed) > 64 {
		return model.User{}, &APIError{Status: 400, Message: "name must be 1..64 characters after trim"}
	}

	user := model.User{
		ID:        uuid.New(),
		Name:      trimmed,
		CreatedAt: time.Now().UTC(),
	}

	s.mu.Lock()
	s.users[user.ID] = user
	s.mu.Unlock()

	return user, nil
}

func (s *UserStore) Exists(id uuid.UUID) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.users[id]
	return ok
}

func (s *UserStore) List(page, pageSize int, sort, order string) (model.UserListResponse, error) {
	if page < 1 {
		return model.UserListResponse{}, &APIError{Status: 400, Message: "page must be >= 1"}
	}
	if pageSize < 1 || pageSize > 100 {
		return model.UserListResponse{}, &APIError{Status: 400, Message: "page_size must be 1..100"}
	}

	sort = strings.ToLower(sort)
	switch sort {
	case "name", "created_at", "id":
	default:
		return model.UserListResponse{}, &APIError{Status: 400, Message: "sort must be one of: name, created_at, id"}
	}

	order = strings.ToLower(order)
	switch order {
	case "asc", "desc":
	default:
		return model.UserListResponse{}, &APIError{Status: 400, Message: "order must be one of: asc, desc"}
	}

	s.mu.RLock()
	items := make([]model.User, 0, len(s.users))
	for _, u := range s.users {
		items = append(items, u)
	}
	s.mu.RUnlock()

	slices.SortFunc(items, func(a, b model.User) int {
		var result int
		switch sort {
		case "name":
			result = strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
			if result == 0 {
				result = cmp.Compare(a.ID.String(), b.ID.String())
			}
		case "id":
			result = cmp.Compare(a.ID.String(), b.ID.String())
		default: // created_at
			result = a.CreatedAt.Compare(b.CreatedAt)
			if result == 0 {
				result = cmp.Compare(a.ID.String(), b.ID.String())
			}
		}
		if order == "desc" {
			return -result
		}
		return result
	})

	total := len(items)
	totalPages := 0
	if total > 0 {
		totalPages = (total + pageSize - 1) / pageSize
	}

	from := (page - 1) * pageSize
	if from > total {
		from = total
	}
	to := from + pageSize
	if to > total {
		to = total
	}

	pageItems := items[from:to]
	if pageItems == nil {
		pageItems = []model.User{}
	}

	return model.UserListResponse{
		Items:      pageItems,
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}
