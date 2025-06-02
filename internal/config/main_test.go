package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestConfigAdminUsersUnset(t *testing.T) {
	assert.Equal(t, "", os.Getenv("ADMIN_USERNAMES"))
	assert.Len(t, AdminUsernames(), 0)
	t.Setenv("ADMIN_USERNAMES", "bob")
	assert.Equal(t, []types.Username{"bob"}, AdminUsernames())
	t.Setenv("ADMIN_USERNAMES", "bob,alice")
	assert.Equal(t, []types.Username{"bob", "alice"}, AdminUsernames())
}
