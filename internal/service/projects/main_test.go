package projects

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// validProjectTRERequest returns a request that passes every validation check
// Individual test cases mutate a copy to exercise a single validation branch.
func validProjectTRERequest() openapi.ProjectTRERequest {
	return openapi.ProjectTRERequest{
		Name:                       "proj123",
		StudyId:                    uuid.NewString(),
		NumRequiredEgressApprovals: 1,
	}
}

func whitelist(entries ...string) types.ProjectTREWhitelist {
	return entries
}

func TestCreateProjectTRE(t *testing.T) {
	svc := &Service{}
	creator := types.User{Username: "creator@example.com"}

	tests := []struct {
		name    string
		mutate  func(*openapi.ProjectTRERequest)
		wantErr string
	}{
		{
			name:    "name too short",
			mutate:  func(r *openapi.ProjectTRERequest) { r.Name = "abc" },
			wantErr: "Project name must be",
		},
		{
			name:    "name too long",
			mutate:  func(r *openapi.ProjectTRERequest) { r.Name = "thisnameistoolong" },
			wantErr: "Project name must be",
		},
		{
			name:    "name with uppercase letters",
			mutate:  func(r *openapi.ProjectTRERequest) { r.Name = "Proj123" },
			wantErr: "Project name must be",
		},
		{
			name:    "name with disallowed characters",
			mutate:  func(r *openapi.ProjectTRERequest) { r.Name = "proj-123" },
			wantErr: "Project name must be",
		},
		{
			name:    "empty name",
			mutate:  func(r *openapi.ProjectTRERequest) { r.Name = "" },
			wantErr: "Project name must be",
		},
		{
			name:    "zero required egress approvals",
			mutate:  func(r *openapi.ProjectTRERequest) { r.NumRequiredEgressApprovals = 0 },
			wantErr: "cannot have fewer than 1 egress approver",
		},
		{
			name:    "negative required egress approvals",
			mutate:  func(r *openapi.ProjectTRERequest) { r.NumRequiredEgressApprovals = -1 },
			wantErr: "cannot have fewer than 1 egress approver",
		},
		{
			name:    "airlock whitelist with malformed entry",
			mutate:  func(r *openapi.ProjectTRERequest) { r.AirlockWhitelist = whitelist("not an ip!") },
			wantErr: "airlock whitelist must contain only IPs or FQDNs",
		},
		{
			name:    "airlock whitelist rejects IPv6",
			mutate:  func(r *openapi.ProjectTRERequest) { r.AirlockWhitelist = whitelist("::1") },
			wantErr: "airlock whitelist must contain only IPs or FQDNs",
		},
		{
			name:    "airlock whitelist with one valid and one invalid entry",
			mutate:  func(r *openapi.ProjectTRERequest) { r.AirlockWhitelist = whitelist("192.168.0.1", "bad host") },
			wantErr: "airlock whitelist must contain only IPs or FQDNs",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := validProjectTRERequest()
			tc.mutate(&req)

			err := svc.CreateProjectTRE(context.Background(), creator, uuid.New(), req)

			require.Error(t, err)
			assert.ErrorContains(t, err, tc.wantErr)
			assert.IsType(t, &types.ErrClientInvalidObject{}, err,
				"validation failures should map to a 400 client error")
		})
	}
}

func TestValidateProjectTREBaseAcceptsValidWhitelist(t *testing.T) {
	svc := &Service{}

	tests := []struct {
		name string
		base openapi.ProjectTREBase
	}{
		{
			name: "nil whitelist",
			base: openapi.ProjectTREBase{NumRequiredEgressApprovals: 1},
		},
		{
			name: "empty whitelist",
			base: openapi.ProjectTREBase{NumRequiredEgressApprovals: 1, AirlockWhitelist: whitelist()},
		},
		{
			name: "IPv4 and FQDN entries",
			base: openapi.ProjectTREBase{
				NumRequiredEgressApprovals: 1,
				AirlockWhitelist:           whitelist("192.168.0.1", "example.com", "sub.example.co.uk"),
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			assert.NoError(t, svc.validateProjectTREBase(tc.base))
		})
	}
}

func TestMakeValidUnixUsername(t *testing.T) {
	badEmailError := errors.New("invalid email")
	invalidCharsError := errors.New("no valid characters")

	tests := []struct {
		name  string
		email string
		want  string
		err   error
	}{
		{
			name:  "UCL email returns local part as-is",
			email: "abcdef@ac.ucl.uk",
			want:  "abcdef",
			err:   nil,
		},
		{
			name:  "lowercase local part",
			email: "foo123@example.com",
			want:  "foo123",
			err:   nil,
		},
		{
			name:  "uppercase is lowercased",
			email: "Foo123@example.com",
			want:  "foo123",
			err:   nil,
		},
		{
			name:  "dot and plus characters map to underscore",
			email: "john.doe+test@example.com",
			want:  "john_doe_t",
		},
		{
			name:  "leading digit replaced by underscore",
			email: "123foo@example.com",
			want:  "_23foo",
			err:   nil,
		},
		{
			name:  "leading hyphen replaced by underscore",
			email: "-abc@example.com",
			want:  "_abc",
			err:   nil,
		},
		{
			name:  "leading dot/plus character is dropped",
			email: ".foo123@example.com",
			want:  "foo123",
			err:   nil,
		},
		{
			name:  "leading underscore allowed",
			email: "_foo123@example.com",
			want:  "_foo123",
			err:   nil,
		},
		{
			name:  "username truncated to 10 characters",
			email: "foo123456789@example.com",
			want:  "foo1234567",
			err:   nil,
		},
		{
			name:  "disallowed characters are dropped",
			email: "a!b#c1%2@example.com",
			want:  "abc12",
			err:   nil,
		},
		{
			name:  "no valid characters in local part",
			email: "#.%@example.com",
			want:  "",
			err:   invalidCharsError,
		},
		{
			name:  "empty local part returns empty string",
			email: "@example.com",
			want:  "",
			err:   badEmailError,
		},
		{
			name:  "empty domain returns empty string",
			email: "john.doe@",
			want:  "",
			err:   badEmailError,
		},
		{
			name:  "no @ character returns empty string",
			email: "notanemail",
			want:  "",
			err:   badEmailError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			username, err := makeValidUnixUsername(tc.email)
			assert.Equal(t, tc.err, err)
			assert.Equal(t, tc.want, username)
		})
	}
}
