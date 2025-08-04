package web

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestEntraUsernameForExternalEmail(t *testing.T) {
	email := "hello@example.com"
	expectedEmail := "hello_example.com#EXT#@" + config.EntraTenantPrimaryDomain()
	assert.Equal(t, expectedEmail, EntraUsernameForExternalEmail(email))
}
