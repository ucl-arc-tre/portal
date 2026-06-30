package validation

import "testing"

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
		if result != tc.expect {
			t.Errorf("IsIPv4OrFQDN(%q) = %v; want %v", tc.ip, result, tc.expect)
		}
	}
}
