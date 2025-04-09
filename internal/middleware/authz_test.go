package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func newTestCasbinEnforcer() *casbin.Enforcer {
	enforcer, _ := casbin.NewEnforcer("testdata/casbin_model.conf", "testdata/casbin_policy.csv")
	return enforcer
}

func newEvaluatedCtxWithUsernameMethodPath(username string, method string, path string) *gin.Context {
	authorizer := &Authorizer{newTestCasbinEnforcer()}
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Set("user", types.User{Username: username})
	ctx.Request, _ = http.NewRequest(method, path, nil)
	authorizer.eval(ctx)
	return ctx
}

func TestAuthzAllowedRead(t *testing.T) {
	path := "/api/v0/alice-read"
	for _, method := range []string{"GET", "HEAD"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath("alice", method, path)
		assert.Equal(t, 200, ctx.Writer.Status())
	}
}

func TestAuthzAllowedWrite(t *testing.T) {
	path := "/api/v0/bob-write"
	for _, method := range []string{"PUT", "POST", "DELETE"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath("bob", method, path)
		assert.Equal(t, 200, ctx.Writer.Status())
	}
}

func TestAuthzDisallowedWrite(t *testing.T) {
	path := "/api/v0/bob-write"
	for _, method := range []string{"PUT", "POST", "DELETE"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath("alice", method, path)
		assert.Equal(t, 403, ctx.Writer.Status())
		assert.True(t, ctx.IsAborted())
	}
}
