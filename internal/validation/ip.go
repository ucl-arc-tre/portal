package validation

import (
	"net"
	"regexp"
)

var fqdnRegex = regexp.MustCompile(
	`^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`,
)

func IsIPv4OrFQDN(ip string) bool {
	if ip := net.ParseIP(ip); ip != nil {
		return ip.To4() != nil
	}
	return isFQDN(ip)
}

func isFQDN(s string) bool {
	if len(s) > 253 {
		return false
	}
	return fqdnRegex.MatchString(s)
}
