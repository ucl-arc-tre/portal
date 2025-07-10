package main

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const (
	baseUrl        = "http://api:8080/tre/api/v0"
	username       = "username" // Must match e2e config values
	password       = "password" // pragma: allowlist secret
	requestTimeout = 1 * time.Second
)

func TestCanGetUserStatus(t *testing.T) {
	request, err := http.NewRequest("GET", fmt.Sprintf("%v/user-status", baseUrl), nil)
	assert.NoError(t, err)

	query := request.URL.Query()
	query.Add("username", "bob@example.com")
	request.URL.RawQuery = query.Encode()
	request.SetBasicAuth(username, password)
	client := &http.Client{Timeout: requestTimeout}
	response, err := client.Do(request)

	assert.NoError(t, err)
	assert.Equal(t, 404, response.StatusCode)
}
