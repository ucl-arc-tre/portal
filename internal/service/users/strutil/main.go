package strutil

import (
	"strings"
)

// Adapted from https://github.com/adrg/strutil

// Levenshtein represents the Levenshtein metric for measuring the similarity
// between sequences.
//
// For more information see https://en.wikipedia.org/wiki/Levenshtein_distance.
type Levenshtein struct {
	InsertCost  int
	DeleteCost  int
	ReplaceCost int
}

// Compute the Levenshtein similarity between two strings. Returns a value
// between 0 (different) and 1 (identical)
func LevenshteinSimilarity(a string, b string) float64 {
	m := Levenshtein{InsertCost: 1, DeleteCost: 1, ReplaceCost: 1}
	distance, maxLen := m.distance(a, b)
	return 1 - float64(distance)/float64(maxLen)
}

func (m *Levenshtein) distance(a, b string) (int, int) {
	a = strings.ToLower(a)
	b = strings.ToLower(b)
	runesA, runesB := []rune(a), []rune(b)

	lenA, lenB := len(runesA), len(runesB)
	if lenA == 0 && lenB == 0 {
		return 0, 0
	}

	maxLen := max(lenA, lenB)
	if lenA == 0 {
		return m.InsertCost * lenB, maxLen
	}
	if lenB == 0 {
		return m.DeleteCost * lenA, maxLen
	}

	prevCol := make([]int, lenB+1)
	for i := 0; i <= lenB; i++ {
		prevCol[i] = i
	}

	col := make([]int, lenB+1)
	for i := range lenA {
		col[0] = i + 1
		for j := range lenB {
			delCost := prevCol[j+1] + m.DeleteCost
			insCost := col[j] + m.InsertCost

			subCost := prevCol[j]
			if runesA[i] != runesB[j] {
				subCost += m.ReplaceCost
			}
			col[j+1] = min(delCost, insCost, subCost)
		}
		col, prevCol = prevCol, col
	}

	return prevCol[lenB], maxLen
}

func min(args ...int) int {
	if len(args) == 0 {
		return 0
	}
	min := args[0]
	for _, arg := range args[1:] {
		if min > arg {
			min = arg
		}
	}
	return min
}

func max(args ...int) int {
	if len(args) == 0 {
		return 0
	}
	max := args[0]
	for _, arg := range args[1:] {
		if max < arg {
			max = arg
		}
	}
	return max
}
