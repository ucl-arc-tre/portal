package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	aliceID = uuid.MustParse("3c641bce-93e7-4824-b103-49cec25e53ff")
	bobId   = uuid.MustParse("17dfc23a-51f6-49cc-b429-6a6a3f9ccf8e")
)

func newTestCasbinEnforcer() *casbin.Enforcer {
	enforcer, _ := casbin.NewEnforcer("testdata/casbin_model.conf", "testdata/casbin_policy.csv")
	return enforcer
}

func newEvaluatedCtxWithUsernameMethodPath(id uuid.UUID, method string, path string) *gin.Context {
	authorizer := &Authorizer{newTestCasbinEnforcer()}
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Set("user", types.User{Model: types.Model{ID: id}})
	ctx.Request, _ = http.NewRequest(method, path, nil)
	authorizer.eval(ctx)
	return ctx
}

func TestAuthzAllowedRead(t *testing.T) {
	path := "/api/v0/alice-read"
	for _, method := range []string{"GET", "HEAD"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath(aliceID, method, path)
		assert.Equal(t, 200, ctx.Writer.Status())
	}
}

func TestAuthzAllowedWrite(t *testing.T) {
	path := "/api/v0/bob-write"
	for _, method := range []string{"PUT", "POST", "DELETE"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath(bobId, method, path)
		assert.Equal(t, 200, ctx.Writer.Status())
	}
}

func TestAuthzDisallowedWrite(t *testing.T) {
	path := "/api/v0/bob-write"
	for _, method := range []string{"PUT", "POST", "DELETE"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath(aliceID, method, path)
		assert.Equal(t, 403, ctx.Writer.Status())
		assert.True(t, ctx.IsAborted())
	}
}

func TestAuthzDisallowedRead(t *testing.T) {
	path := "/api/v0/alice-read"
	for _, method := range []string{"GET", "HEAD"} {
		ctx := newEvaluatedCtxWithUsernameMethodPath(bobId, method, path)
		assert.Equal(t, 403, ctx.Writer.Status())
		assert.True(t, ctx.IsAborted())
	}
}
