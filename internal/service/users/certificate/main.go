package certificate

import (
	"errors"
	"fmt"
	"regexp"
	"time"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	newLinesRegex = regexp.MustCompile(`\r?\n`)
)

func Kind(contentBase64 string) (openapi.TrainingKind, error) {
	text, err := firstPageText(contentBase64)
	if err != nil {
		return "", err
	}
	if nhsdMatch.isValid.MatchString(text) {
		return openapi.TrainingKindNhsd, nil
	}
	if uclhIgMatch.isValid.MatchString(text) {
		return openapi.TrainingKindUclhIg, nil
	}
	return "", types.NewErrClientInvalidObjectF("unable to determine training kind")
}

func parseCertificate(cfg MatchConfig, contentBase64 string) (*TrainingCertificate, error) {
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
	errs := []error{}
	errs = append(errs, setCertificateName(cfg, &certificate, text))
	errs = append(errs, setCertificateIssuedAt(cfg, &certificate, text))
	return &certificate, errors.Join(errs...)
}

func setCertificateName(cfg MatchConfig, certificate *TrainingCertificate, text string) error {
	if matches := cfg.name.FindStringSubmatch(text); len(matches) < 2 {
		return fmt.Errorf("failed to match name")
	} else {
		certificate.Name = matches[1]
	}
	return nil
}

func setCertificateIssuedAt(cfg MatchConfig, certificate *TrainingCertificate, text string) error {
	matches := cfg.issuedAt.FindStringSubmatch(text)
	if len(matches) < 2 {
		return fmt.Errorf("failed to match expiry")
	}
	expiryString := matches[1]

	errs := []error{}
	for _, dateFormat := range cfg.dateFormatOptions {
		issuedAt, err := time.Parse(dateFormat, expiryString)

		if err != nil {
			errs = append(errs, err)
			continue
		}
		certificate.IssuedAt = issuedAt
		return nil
	}
	return errors.Join(errs...)
}
