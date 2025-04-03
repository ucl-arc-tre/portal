package router

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPingRoute(t *testing.T) {
	t.Setenv("IS_TESTING", "true")
	router := New()

	response := httptest.NewRecorder()
	request, err := http.NewRequest("GET", "/ping", nil)
	assert.NoError(t, err)
	router.ServeHTTP(response, request)

	assert.Equal(t, 200, response.Code)
	assert.Equal(t, `{"message":"pong"}`, response.Body.String())
}
