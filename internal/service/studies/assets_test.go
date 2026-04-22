//go:build !integration

package studies

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func ptr[T any](value T) *T { return &value }

func validAssetBase() openapi.AssetBase {
	return openapi.AssetBase{
		Title:                "Valid Asset",
		Description:          "Valid description",
		ClassificationImpact: openapi.AssetBaseClassificationImpactPublic,
		Tier:                 1,
		Locations:            []string{"UK"},
		Protection:           openapi.AssetBaseProtectionAnonymisation,
		LegalBasis:           openapi.AssetBaseLegalBasisConsent,
		Format:               openapi.AssetBaseFormatElectronic,
		ExpiresAt:            ptr(time.Now().Format(config.DateFormat)),
		Status:               openapi.AssetBaseStatusActive,
	}
}

// Unit test : TestValidateAssetData uses a table-driven unit test, which
// defines test cases in a slice, to test all branches in validateAssetData
func TestValidateAssetData(t *testing.T) {
	svc := &Service{}

	tests := []struct {
		name      string
		modify    func(*openapi.AssetBase)
		wantError bool
	}{
		// =========================
		//  VALID CASES
		// =========================
		{
			name:      "valid asset (baseline)",
			modify:    func(a *openapi.AssetBase) {},
			wantError: false,
		},
		{
			name: "title at minimum length",
			modify: func(a *openapi.AssetBase) {
				a.Title = "abcd"
			},
			wantError: false,
		},
		{
			name: "tier at lower boundary",
			modify: func(a *openapi.AssetBase) {
				a.Tier = 0
			},
			wantError: false,
		},
		{
			name: "tier at upper boundary",
			modify: func(a *openapi.AssetBase) {
				a.Tier = 4
			},
			wantError: false,
		},
		{
			name: "valid expiry date",
			modify: func(a *openapi.AssetBase) {
				a.ExpiresAt = ptr("2025-12-31")
			},
			wantError: false,
		},
		{
			name: "no expiry date",
			modify: func(a *openapi.AssetBase) {
				a.ExpiresAt = nil
			},
			wantError: false,
		},

		// =========================
		//  INVALID CASES
		// =========================
		{
			name: "title too short",
			modify: func(a *openapi.AssetBase) {
				a.Title = "x"
			},
			wantError: true,
		},
		{
			name: "description too short",
			modify: func(a *openapi.AssetBase) {
				a.Description = "x"
			},
			wantError: true,
		},
		{
			name: "invalid classification",
			modify: func(a *openapi.AssetBase) {
				a.ClassificationImpact = "invalid"
			},
			wantError: true,
		},
		{
			name: "tier too low",
			modify: func(a *openapi.AssetBase) {
				a.Tier = -1
			},
			wantError: true,
		},
		{
			name: "tier too high",
			modify: func(a *openapi.AssetBase) {
				a.Tier = 5
			},
			wantError: true,
		},
		{
			name: "invalid protection",
			modify: func(a *openapi.AssetBase) {
				a.Protection = "invalid"
			},
			wantError: true,
		},
		{
			name: "invalid legal basis",
			modify: func(a *openapi.AssetBase) {
				a.LegalBasis = "invalid"
			},
			wantError: true,
		},
		{
			name: "invalid format",
			modify: func(a *openapi.AssetBase) {
				a.Format = "invalid"
			},
			wantError: true,
		},
		{
			name: "invalid expiry date",
			modify: func(a *openapi.AssetBase) {
				a.ExpiresAt = ptr("not-a-date")
			},
			wantError: true,
		},
		{
			name: "invalid status",
			modify: func(a *openapi.AssetBase) {
				a.Status = "invalid"
			},
			wantError: true,
		},

		// =========================
		//  EDGE CASES
		// =========================
		{
			name: "empty title",
			modify: func(a *openapi.AssetBase) {
				a.Title = ""
			},
			wantError: true,
		},
		{
			name: "whitespace title",
			modify: func(a *openapi.AssetBase) {
				a.Title = "   "
			},
			wantError: true,
		},
		{
			name: "nil locations",
			modify: func(a *openapi.AssetBase) {
				a.Locations = nil
			},
			wantError: true,
		},
		{
			name: "empty locations",
			modify: func(a *openapi.AssetBase) {
				a.Locations = []string{}
			},
			wantError: true,
		},
	}

	for _, curTest := range tests {
		t.Run(curTest.name, func(t *testing.T) {
			asset := validAssetBase()
			curTest.modify(&asset)

			err := svc.validateAssetData(asset)

			// Stop immediately if system-level error (e.g., panic, DB error)
			if errors.Is(err, types.ErrServerError) {
				require.NoError(t, err, "unexpected error: %+v", err)
			}

			assert.Equal(t, curTest.wantError, err != nil, "validationErr: %+v", err)
		})
	}
}
