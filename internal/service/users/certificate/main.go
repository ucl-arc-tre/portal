package certificate

import (
	"regexp"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	newLinesRegex = regexp.MustCompile(`\r?\n`)
)

func Kind(contentBase64 string) (types.TrainingKind, error) {
	text, err := firstPageText(contentBase64)
	if err != nil {
		return "", err
	}
	if nhsdMatch.isValid.MatchString(text) {
		return types.TrainingKindNHSD, nil
	}
	if uclhIgMatch.isValid.MatchString(text) {
		return types.TrainingKindUCLHIg, nil
	}
	return "", types.NewErrClientInvalidObjectF("unable to determine training kind")
}

func Parse(kind types.TrainingKind, contentBase64 string) (*TrainingCertificate, error) {
	var cfg MatchConfig
	switch kind {
	case types.TrainingKindNHSD:
		cfg = nhsdMatch
	case types.TrainingKindUCLHIg:
		cfg = uclhIgMatch
	}

	text, err := firstPageText(contentBase64)
	if err != nil {
		return nil, err
	}
	if isValid := cfg.isValid.MatchString(text); !isValid {
		return &TrainingCertificate{IsValid: false}, nil
	}
	certificate := TrainingCertificate{
		IsValid: true,
	}

	if matches := cfg.name.FindStringSubmatch(text); len(matches) < 2 {
		log.Debug().Msg("failed to match certificate name")
	} else {
		certificate.Name = matches[1]
	}

	matches := cfg.issuedAt.FindStringSubmatch(text)
	if len(matches) < 2 {
		log.Debug().Msg("failed to match expiry")
	} else {
		expiryString := matches[1]
		for _, dateFormat := range cfg.dateFormatOptions {
			issuedAt, err := time.Parse(dateFormat, expiryString)
			if err != nil {
				log.Debug().Err(err).Msg("failed to match expiry")
				continue
			}
			certificate.IssuedAt = issuedAt
			break
		}
	}
	return &certificate, nil
}
