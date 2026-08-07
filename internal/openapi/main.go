package openapi

//go:generate go tool oapi-codegen -config .config.yaml -generate "gin,types" -package openapi -o web/main.gen.go ../../api/web.yaml
//go:generate go tool oapi-codegen -config .config.yaml -generate "gin,types" -package openapi -o tre/main.gen.go ../../api/tre.yaml
//go:generate go tool oapi-codegen -config .config.yaml -generate "gin,types" -package openapi -o dsh/main.gen.go ../../api/dsh.yaml
