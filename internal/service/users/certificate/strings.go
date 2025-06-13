package certificate

import "strings"

func stripHyphens(value string) string {
	return strings.ReplaceAll(value, "-", " ")
}

func caseInsensitiveMatch(a string, b string) bool {
	return strings.EqualFold(a, b)
}
