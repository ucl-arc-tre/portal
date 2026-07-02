package validation

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsIPv4OrFQDN(t *testing.T) {
	testCases := []struct {
		ip     string
		expect bool
	}{
		{"192.168.1.1", true},
		{"example.ucl.ac.uk", true},
		{"invalid-ip", false},
		{"", false},
	}

	for _, tc := range testCases {
		result := IsIPv4OrFQDN(tc.ip)
		assert.Equal(t, tc.expect, result)
	}
}
