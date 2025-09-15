package entra

import (
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

	expectedUserId := "hello_example.com#EXT#@" + testTenantDomain

	extFormatUserId, err := userIdForExternal(username)
	assert.NoError(t, err, "EntraUsernameForExternalEmail returned an error")
	assert.Equal(t, expectedUserId, extFormatUserId)
}

func TestEmployeeTypeStaffRegex(t *testing.T) {
	for _, valid := range []string{"Staff", "staff", "Staff, Alumnus", "Alumnus, Staff", "a,staff"} {
		assert.True(t, employeeTypeIsStaff(valid), valid)
	}
	for _, invalid := range []string{"Staffandother", "astaffb", "student", "a, b", "otherstaff"} {
		assert.False(t, employeeTypeIsStaff(invalid), invalid)
	}
}
