package validation

import (
	"regexp"
)

// Common validation patterns used across the application
var (
	StudyTitlePattern             = regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`) // 4-50 chars alphanumeric and spaces
	StudyDescriptionPattern       = regexp.MustCompile(`^[\s\S]{0,255}$`)      // <256 chars including newlines
	DataProtectionNumberPattern   = regexp.MustCompile(`^\w+\/\d{4}\/\d{2}\/(?:(?:0[1-9])|(?:[1-9]\d{1,2}))$`)
	CagPattern                    = regexp.MustCompile(`^\d{2}/CAG/\d{4}$`)
	NhsePattern                   = regexp.MustCompile(`^DARS-NIC-\d{6}-\d{5}-\d{2}$`)
	AssetTitlePattern             = regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`) // 4-50 chars, starts/ends with alphanumeric, only letters/numbers/spaces/hyphens
	AssetDescriptionPattern       = regexp.MustCompile(`^.{4,255}$`)           // 4-255 characters, any content
	ContractNamePattern           = regexp.MustCompile(`^.{2,100}$`)           // 2-100 characters, any content
	TREProjectNamePattern         = regexp.MustCompile(`^[0-9a-z]{4,14}$`)     // 4-14 lowercase alphanumeric characters only
	TokenNamePattern              = regexp.MustCompile(`^.{1,50}$`)            // 1-50 characters, any content
	OtherSignatoriesStringPattern = regexp.MustCompile(`^.{0,255}$`)           // 1-255 characters, any content
)
