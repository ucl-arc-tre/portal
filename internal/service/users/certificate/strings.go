package certificate

import (
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

func stripHyphens(value string) string {
	return strings.ReplaceAll(value, "-", " ")
}

func caseInsensitiveMatch(a string, b string) bool {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	a, _, _ = transform.String(t, a)
	b, _, _ = transform.String(t, b)
	return strings.EqualFold(a, b)
}
