package validation

import "regexp"

// Common validation patterns used across the application
var (
	AssetTitlePattern       = regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`) // 4-50 chars, starts/ends with alphanumeric, only letters/numbers/spaces/hyphens
	AssetDescriptionPattern = regexp.MustCompile(`^.{4,255}$`)           // 4-255 characters, any content
	TextField500Pattern     = regexp.MustCompile(`^.{1,500}$`)           // 1-500 characters, any content
	ContractNamePattern     = regexp.MustCompile(`^.{2,100}$`)           // 2-100 characters, any content
)
