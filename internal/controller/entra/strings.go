package entra

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
