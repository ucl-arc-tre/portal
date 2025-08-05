package web

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestEntraUsernameForExternalEmail(t *testing.T) {

	testTenantDomain, _ := config.EntraDomainForTesting()
	email := "hello@example.com"
	expectedEmail := "hello_example.com#EXT#@" + testTenantDomain

	extFormatEmail, err := EntraUsernameForExternalEmail(email)
	assert.NoError(t, err, "EntraUsernameForExternalEmail returned an error")
	assert.Equal(t, expectedEmail, extFormatEmail)
}
