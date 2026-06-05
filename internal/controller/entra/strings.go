package entra

import (
	"maps"
	"slices"
)

func replaceLastUnderscoreWithAtSymbol(s string) string {
	lastUnderscoreIdx := -1
	for i, char := range s {
		if char == rune('_') {
			lastUnderscoreIdx = i
		}
	}
	chars := []byte(s)
	if lastUnderscoreIdx >= 0 {
		chars[lastUnderscoreIdx] = '@'
	}
	return string(chars)
}

// Get the unique objects from a slice of comparable objects
func unique[T comparable](objs []T) []T {
	unique := map[T]struct{}{}
	for _, s := range objs {
		unique[s] = struct{}{}
	}
	return slices.Collect(maps.Keys(unique))
}
