package certificate

import (
	"encoding/base64"
	"time"

	"github.com/klippa-app/go-pdfium"
	pdfref "github.com/klippa-app/go-pdfium/references"
	pdfreq "github.com/klippa-app/go-pdfium/requests"
	pdfwasm "github.com/klippa-app/go-pdfium/webassembly"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var pdfWasmPool = must(pdfwasm.Init(pdfwasm.Config{
	MinIdle:  0,
	MaxIdle:  1,
	MaxTotal: 1,
}))

func firstPageText(contentBase64 string) (string, error) {
	content, err := base64.StdEncoding.DecodeString(contentBase64)
	if err != nil {
		return "", types.NewErrInvalidObject(err)
	}
	text, err := getFirstPageText(content)
	if err != nil {
		return "", err
	}
	text = newLinesRegex.ReplaceAllString(text, " ")
	return text, nil
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
