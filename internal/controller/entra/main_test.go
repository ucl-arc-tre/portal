package entra

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestEntraUsernameForExternalEmail(t *testing.T) {
	if err := config.SetforTesting("entra.primary_domain", "testTenant.com"); err != nil {
		t.Fatal(err)
	}

	testTenantDomain := config.EntraTenantPrimaryDomain()

	email := "hello@example.com"
	expectedEmail := "hello_example.com#EXT#@" + testTenantDomain

	extFormatEmail, err := entraUsernameForExternalEmail(email)
	assert.NoError(t, err, "EntraUsernameForExternalEmail returned an error")
	assert.Equal(t, expectedEmail, extFormatEmail)
}

func TestEmployeeTypeStaffRegex(t *testing.T) {
	for _, valid := range []string{"Staff", "staff", "Staff, Alumnus"} {
		assert.True(t, employeeTypeIsStaff(valid), valid)
	}
	for _, invalid := range []string{"Staffandother", "astaffb", "student", "a, b"} {
		assert.False(t, employeeTypeIsStaff(invalid), invalid)
	}
}
