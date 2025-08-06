workspace "ARC Services Portal" "Models the architecture of a research services web portal" {

    !identifiers hierarchical

    model {

        properties {
            "structurizr.groupSeparator" "/"
        }

        user = person "Researcher" "Uses the platform to manage their research profile and data."
        admin = person "Admin" "Portal user with elevated permissions to edit data or review submissions."

        entra = softwareSystem "Microsoft Entra" "Identity provider (SSO)" "Existing System"
        tre = softwareSystem "TRE" "Secure processing environment for sensitive research data" "Existing System"
        ghcr = softwareSystem "GitHub Container Registry" "Stores container images" "Existing System"
        uclSystem = softwareSystem "..." "Other UCL consumer of portal data" "Existing System"

        portal = softwareSystem "ARC Services Portal" "Enables management of Studies, Projects, user training and information governance" {

            group "K8S cluster" {

                api = container "API" "API backend with /web/api and /tre/api (and other) endpoints" "Go" {

                    group "Shared Services" {
                        projectService = component "Project Service" "Handles project workflows" "Go"
                        userService = component "User Service" "Handles user workflows" "Go"
                        otherService = component "..." "Other backend services" "Go"
                    }

                    group "Web API" {
                        webhttpHandlers = component "HTTP Handlers for web frontend" "Handles REST endpoints" "Go"
                        webhttpHandlers -> userService "Calls"
                        webhttpHandlers -> projectService "Calls"
                        webhttpHandlers -> otherService "Calls"
                    }

                    group "TRE API" {
                        trehttpHandlers = component "HTTP Handlers for UCL TREs" "Handles REST endpoints" "Go"
                        trehttpHandlers -> userService "Calls"
                        trehttpHandlers -> projectService "Calls"
                        trehttpHandlers -> otherService "Calls"
                    }

                    group "Other API" {
                        otherhttpHandlers = component "HTTP Handlers for other UCL systems" "Handles REST endpoints" "Go"
                        otherhttpHandlers -> otherService "Calls"
                    }
                }

                webFrontend = container "Web Frontend" "User-facing web app" "React, TypeScript" {
                    pages = component "Pages" "UCL Design System-styled pages for profile, studies, projects" "React"
                    apiClient = component "API Client" "Generated from OpenAPI spec" "TypeScript"

                    pages -> apiClient "Calls"
                }

                oauth2Proxy = container "OAuth2 Proxy" "Proxy providing OAuth2 authentication" "quay.io/oauth2-proxy/oauth2-proxy"

                nginx = container "Reverse Proxy" "Routes requests to frontend and backend" "nginx"

                postgres = container "Database" "Stores user, project, portal etc. data" "PostgreSQL"

                api.projectService -> postgres "Reads/writes data"
                api.userService -> postgres "Reads/writes data"
                api.otherService -> postgres "Read/writes data"
                nginx -> api.trehttpHandlers "Proxies /tre/api requests"
                nginx -> api.otherhttpHandlers "Proxies other api requests"
                nginx -> webFrontend.pages "Serves"
                webFrontend.apiClient -> oauth2Proxy "Forwards /web/api requests for authentication"
                oauth2Proxy -> api.webhttpHandlers "Forwards authenticated /web/api requests to backend"

            }

            deploy = container "CI/CD Pipeline" "Builds and deploys infrastructure and app" "GitHub Actions + Terraform" {

                group "Portal App Repository" {
                    gha_portal = component "GitHub Actions (Portal Repo)" "Builds & pushes container images" "GitHub Actions"
                }

                group "Infrastructure Repository" {
                    gha_infra = component "GitHub Actions (Infra Repo)" "Applies Terraform in AWS" "GitHub Actions"
                    tf = component "Terraform Code" "Defines and provisions cloud infra" "Terraform"
                    gha_infra -> tf "Runs"
                }
            }

            portal.deploy.tf -> ghcr "Pulls images for deployment"
            portal.deploy.gha_portal -> ghcr "Pushes container images"
        }

        user -> portal.webFrontend.pages "Accesses via browser"
        admin -> portal.webFrontend.pages "Administers via browser"
        portal.oauth2Proxy -> entra "Authenticates requests against" "SSO"
        tre -> portal.nginx "Accesses /tre/api for data retrieval" "REST/JSON"
        uclSystem -> portal.nginx "Accesses api for data retrieval" "REST/JSON"
    }

    views {

        systemContext portal "C1-Portal_Context" {
            include *
            description "Context diagram showing how the Research Platform fits within the broader environment."
        }

        container portal "C2-Portal_Containers" {
            include *
            description "Container view showing major services running in Kubernetes, including API, frontend, proxy, and DB."
        }

        component portal.api "C3-Web_API_Internals" {
            include *
            description "Component view showing key service components inside the API backend."
        }

        component portal.webFrontend "C3-Web_Frontend_Internals" {
            include *
            description "Component view showing the UI modules and OpenAPI client."
        }

        component portal.deploy "C3-Deployment_Workflow" {
            include *
            description "Component view showing how CI/CD is managed using GitHub Actions and Terraform."
        }

        styles {
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }

            element "Software System" {
                background #1168bd
                color #ffffff
            }

            element "Container" {
                background #438dd5
                color #ffffff
            }

            element "Component" {
                background #85bbf0
                color #000000
            }

            element "Existing System" {
                background #999999
            }

            element "Group:K8S cluster" {
                color #d86613
                icon https://static.structurizr.com/themes/amazon-web-services-2020.04.30/amazon-elastic-kubernetes-service.png
            }
        }
    }
}
