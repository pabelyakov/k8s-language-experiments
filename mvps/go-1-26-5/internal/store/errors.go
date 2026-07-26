package store

// APIError is an HTTP-aware application error.
type APIError struct {
	Status  int
	Message string
}

func (e *APIError) Error() string {
	return e.Message
}

func (e *APIError) StatusCode() int {
	return e.Status
}
