package certificate

import "regexp"

const (
	isValidUclhIgPattern  = `This is to certify that.*completed the (?:course|programme) Information Governance`
	issuedAtUclhIgPattern = `(\w+ \d{1,2}, \d{4})`
	nameUclhIgPattern     = `certify that[\s]*([\w+'’\s?]+) has completed the`
)

var (
	uclhIgMatch = MatchConfig{
		isValid:  regexp.MustCompile(isValidUclhIgPattern),
		issuedAt: regexp.MustCompile(issuedAtUclhIgPattern),
		name:     regexp.MustCompile(nameUclhIgPattern),
		dateFormatOptions: []string{
			"January 02, 2006",
			"January 2, 2006",
		},
	}
)

func ParseUclhIgCertificate(contentBase64 string) (*TrainingCertificate, error) {
	return parseCertificate(uclhIgMatch, contentBase64)
}
