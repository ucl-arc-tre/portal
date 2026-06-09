package certificate

import (
	"regexp"
)

const (
	isValidNhsdPattern  = `This is to certify that.*completed the (?:course|programme) Data Security Awareness`
	issuedAtNhsdPattern = `Data Security Awareness.*On\s*(\d{1,2} \w+ \d{4})\s*This document is a record of completion`
	nameNhsdPattern     = `certify that[\s]*([\w+'’\s?]+)(:? GMC: \d+)? completed the`
)

var (
	nhsdMatch = MatchConfig{
		isValid:           regexp.MustCompile(isValidNhsdPattern),
		issuedAt:          regexp.MustCompile(issuedAtNhsdPattern),
		name:              regexp.MustCompile(nameNhsdPattern),
		dateFormatOptions: []string{"02 January 2006"},
	}
)

func ParseNHSDCertificate(contentBase64 string) (*TrainingCertificate, error) {
	return parseCertificate(nhsdMatch, contentBase64)
}
