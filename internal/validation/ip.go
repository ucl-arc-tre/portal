package validation

import (
	"net"
	"regexp"
)

var fqdnRegex = regexp.MustCompile(
	`^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`,
)

func IsIPv4(value string) bool {
	ip := net.ParseIP(value)
	return ip != nil && ip.To4() != nil
}

func IsIPv4OrFQDN(value string) bool {
	if ip := net.ParseIP(value); ip != nil {
		return ip.To4() != nil
	}
	return isFQDN(value)
}

func isFQDN(s string) bool {
	if len(s) > 253 {
		return false
	}
	return fqdnRegex.MatchString(s)
}
