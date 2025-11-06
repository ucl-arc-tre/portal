package certificate

import (
	"encoding/base64"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/klippa-app/go-pdfium"
	pdfref "github.com/klippa-app/go-pdfium/references"
	pdfreq "github.com/klippa-app/go-pdfium/requests"
	pdfwasm "github.com/klippa-app/go-pdfium/webassembly"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	isValidPattern  = `This is to certify that.*completed the (?:course|programme) Data Security Awareness`
	issuedAtPattern = `Data Security Awareness.*On\s*(\d{1,2} \w+ \d{4})`
	namePattern     = `certify that[\s]*([\w+'\s?]+)(:? GMC: \d+)? completed the`

	nhsdCertificateDateFormat = "02 January 2006"
)

var (
	isValidRegex  = regexp.MustCompile(isValidPattern)
	issuedAtRegex = regexp.MustCompile(issuedAtPattern)
	nameRegex     = regexp.MustCompile(namePattern)
	newLinesRegex = regexp.MustCompile(`\r?\n`)
)

var pdfWasmPool = must(pdfwasm.Init(pdfwasm.Config{
	MinIdle:  0,
	MaxIdle:  1,
	MaxTotal: 1,
}))

func ParseNHSDCertificate(contentBase64 string) (*TrainingCertificate, error) {
	content, err := base64.StdEncoding.DecodeString(contentBase64)
	if err != nil {
		return nil, types.NewErrInvalidObject(err)
	}
	text, err := getFirstPageText(content)
	if err != nil {
		return nil, err
	}
	text = newLinesRegex.ReplaceAllString(text, " ")
	if isValid := isValidRegex.MatchString(text); !isValid {
		return &TrainingCertificate{IsValid: false}, nil
	}
	certificate := TrainingCertificate{
		IsValid: true,
	}
	errs := []error{}
	errs = append(errs, setNHSDCertificateName(&certificate, text))
	errs = append(errs, setNHSDCertificateIssuedAt(&certificate, text))
	return &certificate, errors.Join(errs...)
}

func setNHSDCertificateName(certificate *TrainingCertificate, text string) error {
	if matches := nameRegex.FindStringSubmatch(text); len(matches) < 2 {
		return fmt.Errorf("failed to match name")
	} else {
		certificate.Name = matches[1]
	}
	return nil
}

func setNHSDCertificateIssuedAt(certificate *TrainingCertificate, text string) error {
	matches := issuedAtRegex.FindStringSubmatch(text)
	if len(matches) < 2 {
		return fmt.Errorf("failed to match expiry")
	}
	expiryString := matches[1]
	issuedAt, err := time.Parse(nhsdCertificateDateFormat, expiryString)
	if err != nil {
		return err
	} else {
		certificate.IssuedAt = issuedAt
	}
	return nil
}

func getFirstPageText(content []byte) (string, error) {
	instance, err := pdfWasmPool.GetInstance(100 * time.Millisecond)
	if err != nil {
		return "", types.NewErrServerError(err)
	}
	//nolint:errcheck // always non nil error
	defer instance.Close()
	doc, err := instance.OpenDocument(&pdfreq.OpenDocument{
		File: &content,
	})
	if err != nil {
		return "", types.NewErrServerError(err)
	}
	//nolint:errcheck // always non nil error
	defer instance.FPDF_CloseDocument(&pdfreq.FPDF_CloseDocument{
		Document: doc.Document,
	})
	pageCountResult, err := instance.FPDF_GetPageCount(&pdfreq.FPDF_GetPageCount{
		Document: doc.Document,
	})
	if err != nil {
		return "", types.NewErrServerError(err)
	} else if pageCountResult.PageCount == 0 {
		return "", types.NewErrInvalidObject("PDF had no pages")
	}
	return firstPageTextFromDoc(instance, doc.Document)
}

func firstPageTextFromDoc(instance pdfium.Pdfium, doc pdfref.FPDF_DOCUMENT) (string, error) {
	pageTextResult, err := instance.GetPageText(&pdfreq.GetPageText{
		Page: pdfreq.Page{
			ByIndex: &pdfreq.PageByIndex{
				Document: doc,
				Index:    0,
			},
		},
	})
	if err != nil {
		return "", types.NewErrServerError(err)
	}
	return pageTextResult.Text, nil
}

func must[T any](value T, err error) T {
	assertNoError(err)
	return value
}

func assertNoError(err error) {
	if err != nil {
		panic(err)
	}
}
