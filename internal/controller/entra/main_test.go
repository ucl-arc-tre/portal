package entra

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestEntraUsernameForExternalEmail(t *testing.T) {
	if err := config.SetforTesting("entra.primary_domain", "testTenant.com"); err != nil {
		t.Fatal(err)
	}

	testTenantDomain := config.EntraTenantPrimaryDomain()

	username := types.Username("hello@example.com")
	assert.True(t, usernameIsExternal(username))
	assert.False(t, usernameIsExternal(types.Username("hello@testTenant.com")))

	expectedUserPrincipalName := UserPrincipalName("hello_example.com#EXT#@" + testTenantDomain)

	extFormatUserId, err := userPrincipalNameForExternal(username)
	assert.NoError(t, err, "EntraUsernameForExternalEmail returned an error")
	assert.Equal(t, expectedUserPrincipalName, extFormatUserId)
}

func TestEmployeeTypeStaffRegex(t *testing.T) {
	for _, valid := range []string{"Staff", "staff", "Staff, Alumnus", "Alumnus, Staff", "a,staff"} {
		assert.True(t, employeeTypeIsStaff(valid), valid)
	}
	for _, invalid := range []string{"Staffandother", "astaffb", "student", "a, b", "otherstaff"} {
		assert.False(t, employeeTypeIsStaff(invalid), invalid)
	}
}

func TestUsernameFromUserPrincipalNamePrimaryDomain(t *testing.T) {
	upn := UserPrincipalName("bob.smith@testTenant.com")
	assert.Equal(t, types.Username("bob.smith@testTenant.com"), upn.Username())
}

func TestUsernameFromUserPrincipalNameExternal(t *testing.T) {
	upn := UserPrincipalName("alice.smith@example.com#EXT#@testTenant.com")
	assert.Equal(t, types.Username("alice.smith@example.com"), upn.Username())
}

func TestErrorContains(t *testing.T) {
	assert.False(t, errContains(nil, "anything"))
	assert.False(t, errContains(nil, ""))
	assert.False(t, errContains(errors.New("alice"), "bob"))
	assert.True(t, errContains(errors.New("alice"), "alice"))
	assert.True(t, errContains(errors.New("alice and bob"), "alice"))
}
