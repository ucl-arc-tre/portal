workspace "ARC Services Portal" "Models the current-state architecture of the ARC Services Portal, the SharePoint-based IG portals it replaces and the platforms that integrate with it." {

    !identifiers hierarchical

    model {

        properties {
            "structurizr.groupSeparator" "/"
        }

        // People

        user = person "Researcher" "Manages their profile, training, agreements, studies and project memberships through the Portal."

        igOps = person "IG Operations Staff" "Reviews and approves studies, manages training records and invitations, and views all users, studies and projects."

        treOps = person "TRE Operations Staff" "Approves TRE projects, issues and revokes ARC TRE API tokens, and views all users, studies, assets and TRE projects."

        dshOps = person "DSH Operations Staff" "Issues and revokes Data Safe Haven API tokens and views all users, studies, assets and DSH projects."

        admin = person "Portal Administrator" "Develops and maintains the Portal; does not manage supported services' projects, users or tokens."

        // IG Ops and IG Admin are separate roles in internal/rbac but are shown as one person because
        // they are held by the same team. IG Admins can also edit any study and mark TRE projects for
        // deletion. Ops staff cannot approve studies or projects they own.
        // Portal Administrators hold the Admin role (full access) for support, but operating supported
        // services is left to the IG, TRE and DSH Ops teams.

        // External systems

        entra = softwareSystem "Microsoft Entra ID" "Authenticates UCL and invited external users and provides directory lookups, guest invitations and email through Microsoft Graph." "External System"

        myServices = softwareSystem "MyServices" "Manages incidents, service requests and help requests for UCL services." "External System"

        tre = softwareSystem "ARC Trusted Research Environment" "Provides secure project workspaces for sensitive research data and deploys TRE projects requested through the Portal." "External System"

        // The ARC TRE is deployed on more than one platform (e.g. AWS and Condenser). Each deployment
        // is another instance of the ARC TRE and is not modelled separately here.

        dsh = softwareSystem "Data Safe Haven" "Provides secure file shares for sensitive research data and reports share membership back to the Portal." "External System"

        uclSystem = softwareSystem "Other UCL System" "Represents a future UCL system or ARC service that consumes Portal data through its own API." "External System"

        // Target architecture: no other UCL system consumes the Portal yet. See docs/Service-Onboarding.md.

        aws = softwareSystem "Amazon Web Services" "Hosts the Portal on the ARC TRE's Amazon EKS clusters and provides S3 object storage." "External System"

        ghcr = softwareSystem "GitHub Container Registry" "Stores the Portal's container images." "External System"

        m365Messaging = softwareSystem "Microsoft Teams and Outlook" "Delivers notifications and approval requests to users and staff." "External System"

        // ARC Services Portal

        portal = softwareSystem "ARC Services Portal" "Manages studies, assets, contracts, projects, user training and agreements, and provides governed project and user data to ARC platforms." {

            group "Amazon EKS cluster" {

                nginx = container "Reverse Proxy" "Routes browser requests to the web frontend and API requests to the authentication proxy or the API." "nginx"

                oauth2Proxy = container "Authentication Proxy" "Authenticates browser users and forwards their identity with /web/api requests." "OAuth2 Proxy"

                webFrontend = container "Web Frontend" "Provides the user interface for researchers and Portal staff." "Next.js static export; React; TypeScript; Go file server" {

                    pages = component "Pages" "Renders profile, training, studies, projects, review and token pages styled with the UCL Design System." "Next.js; React"

                    apiClient = component "Web API Client" "Calls the web API using a client generated from the OpenAPI specification." "TypeScript; @hey-api/openapi-ts"
                }

                api = container "API" "Implements the web, TRE and DSH APIs and is the only interface to the Portal database." "Go; Gin" {

                    group "Request handling" {

                        middleware = component "Request Middleware" "Authenticates API clients, checks JWT scopes, enforces role-based access and limits request rates and body sizes." "Gin; Casbin"
                    }

                    group "API handlers" {

                        webhttpHandlers = component "Web API Handlers" "Implements the /web/api endpoints used by the web frontend, as defined in api/web.yaml." "Go; oapi-codegen"

                        trehttpHandlers = component "TRE API Handlers" "Implements the /tre/api endpoints used by the ARC TRE, as defined in api/tre.yaml." "Go; oapi-codegen"

                        dshhttpHandlers = component "DSH API Handlers" "Implements the /dsh/api endpoints used by the Data Safe Haven, as defined in api/dsh.yaml." "Go; oapi-codegen"

                        otherhttpHandlers = component "Future Platform API Handlers" "Represents the endpoints added for each newly onboarded platform, each with its own OpenAPI specification and JWT scopes." "Go; oapi-codegen"
                    }

                    group "Backend services" {

                        userService = component "User Service" "Manages users, attributes, sponsorships, invitations, training records and approved researcher status." "Go"

                        studyService = component "Study Service" "Manages studies, study admins, assets, contracts, reviews and owner changes." "Go"

                        projectService = component "Project Service" "Manages generic projects and their environment-specific subtypes, members, roles and statuses." "Go"

                        tokenService = component "Token Service" "Signs and verifies the JWT bearer tokens that platforms use to call the Portal." "Go; Ed25519"

                        auditService = component "Audit Service" "Records audit events in the same transaction as the change they describe." "Go"

                        notificationService = component "Notification Service" "Creates in-app notifications and sends email notifications." "Go"

                        // Agreement, environment and authorisation services are omitted for clarity.
                    }

                    group "Scheduled tasks" {

                        taskManager = component "Scheduled Task Manager" "Runs daily jobs that refresh user attributes, send expiry notifications and upload audit logs." "Go; gocron"
                    }

                    group "Integration clients" {

                        entraClient = component "Microsoft Graph Client" "Looks up users and staff status, sends guest invitations and sends email." "Go; Microsoft Graph SDK"

                        myServicesClient = component "MyServices Client" "Creates feedback and help requests in MyServices." "Go; oapi-codegen"

                        s3Client = component "Object Storage Client" "Reads and writes contract documents and audit log batches." "Go; AWS SDK"
                    }
                }

                postgres = container "Portal Database" "Stores users, studies, assets, contracts, environments, projects, role bindings, training records, agreements, tokens and audit events." "PostgreSQL; CloudNativePG" "Database"
            }

            objectStore = container "Object Store" "Stores contract documents and exported audit log batches." "Amazon S3" "Data Store"

            backupStore = container "Database Backup Store" "Stores daily base backups and continuous write-ahead log archives, encrypted and retained for 30 days." "Amazon S3" "Data Store"

            deploy = container "Delivery Pipeline" "Builds the Portal's container images and deploys the Portal and its infrastructure." "GitHub Actions; Terraform" {

                group "Portal App Repository" {

                    gha_portal = component "Portal Build Workflows" "Builds, tests and publishes the Portal's container images." "GitHub Actions"
                }

                group "Infrastructure Repository" {

                    gha_infra = component "Infrastructure Deployment Workflows" "Runs Terraform to deploy the Portal to the staging and production clusters." "GitHub Actions"

                    tf = component "Infrastructure Code" "Defines the Portal's Kubernetes resources, database and S3 buckets." "Terraform"
                }
            }

            // Browser traffic

            portal.nginx -> portal.webFrontend.pages "Serves Portal pages from" "HTTP"

            portal.webFrontend.pages -> portal.webFrontend.apiClient "Calls the web API through"

            // Browser API calls pass through the reverse proxy on their way to the authentication proxy;
            // that hop is folded into this relationship to keep the user journey readable.
            portal.webFrontend.apiClient -> portal.oauth2Proxy "Sends web API requests through" "HTTPS/REST and JSON, via the reverse proxy"

            portal.oauth2Proxy -> portal.api.middleware "Forwards authenticated web API requests to" "HTTP"

            // Platform traffic

            // Confirm whether ARC TRE calls reach the API through the reverse proxy or directly through
            // the in-cluster service; the HLD describes them as east-west traffic.
            portal.nginx -> portal.api.middleware "Routes /tre/api, /dsh/api and future platform API requests to" "HTTP"

            portal.api.middleware -> portal.api.webhttpHandlers "Passes authorised /web/api requests to"

            portal.api.middleware -> portal.api.trehttpHandlers "Passes authenticated /tre/api requests to"

            portal.api.middleware -> portal.api.dshhttpHandlers "Passes authenticated /dsh/api requests to"

            portal.api.middleware -> portal.api.otherhttpHandlers "Passes authenticated platform API requests to"

            portal.api.middleware -> portal.api.tokenService "Verifies JWT bearer tokens and scopes using"

            // Handlers to services

            portal.api.webhttpHandlers -> portal.api.userService "Calls"

            portal.api.webhttpHandlers -> portal.api.studyService "Calls"

            portal.api.webhttpHandlers -> portal.api.projectService "Calls"

            portal.api.webhttpHandlers -> portal.api.tokenService "Issues and revokes platform tokens through"

            portal.api.webhttpHandlers -> portal.api.myServicesClient "Submits feedback through"

            portal.api.trehttpHandlers -> portal.api.userService "Reads approved researcher and training status from"

            portal.api.trehttpHandlers -> portal.api.projectService "Reads TRE projects from and writes deployment status to"

            portal.api.dshhttpHandlers -> portal.api.userService "Reads approved researchers from"

            portal.api.dshhttpHandlers -> portal.api.studyService "Reads approved studies from"

            portal.api.dshhttpHandlers -> portal.api.projectService "Imports DSH share members into"

            portal.api.otherhttpHandlers -> portal.api.projectService "Reads and updates platform projects through"

            portal.api.otherhttpHandlers -> portal.api.userService "Reads approved researcher status from"

            // Services to data and integrations

            portal.api.userService -> portal.postgres "Reads from and writes to" "PostgreSQL protocol"

            portal.api.studyService -> portal.postgres "Reads from and writes to" "PostgreSQL protocol"

            portal.api.projectService -> portal.postgres "Reads from and writes to" "PostgreSQL protocol"

            portal.api.tokenService -> portal.postgres "Reads from and writes to" "PostgreSQL protocol"

            portal.api.auditService -> portal.postgres "Writes audit events to" "PostgreSQL protocol"

            portal.api.notificationService -> portal.postgres "Reads from and writes to" "PostgreSQL protocol"

            portal.api.studyService -> portal.api.auditService "Records study changes through"

            portal.api.projectService -> portal.api.auditService "Records project changes through"

            portal.api.userService -> portal.api.auditService "Records training record changes through"

            portal.api.studyService -> portal.api.notificationService "Notifies study owners and admins through"

            portal.api.studyService -> portal.api.s3Client "Stores and retrieves contract documents through"

            portal.api.userService -> portal.api.entraClient "Looks up users and staff status and sends invitations through"

            portal.api.notificationService -> portal.api.entraClient "Sends email through"

            portal.api.taskManager -> portal.api.userService "Refreshes user attributes through"

            portal.api.taskManager -> portal.api.notificationService "Sends training, asset and contract expiry notifications through"

            portal.api.taskManager -> portal.api.s3Client "Uploads audit log batches through"

            portal.api.s3Client -> portal.objectStore "Reads from and writes to" "S3 API"

            portal.postgres -> portal.backupStore "Archives base backups and write-ahead logs to" "S3 API"

            // Delivery

            portal.deploy.gha_infra -> portal.deploy.tf "Applies"
        }

        // IG SharePoint Portals (as-is)

        // The SharePoint-based portals are the as-is state that the ARC Services Portal replaces.
        // They are owned by the IG Advisory Service and the ARC TRE team, not the Portal team.

        igSharePoint = softwareSystem "IG Advisory SharePoint Portal" "Collects study registrations, user onboarding and data asset information for the IG Advisory Service." "Existing System" {

            igPowerApps = container "Study Management Apps/Forms" "Provides the forms researchers use to register studies, onboard users and update cases." "Microsoft PowerApps"

            igFlows = container "Power Automate Flows" "Routes approvals, sends notifications and writes case data to SharePoint lists." "Microsoft Power Automate"

            igLists = container "Cases List" "Stores cases, studies, researchers and data assets in several SharePoint lists." "Microsoft SharePoint Lists" "Data Store"

            igSharePoint.igPowerApps -> igSharePoint.igFlows "Triggers"

            igSharePoint.igFlows -> igSharePoint.igLists "Writes case data to"
        }

        treSharePoint = softwareSystem "TRE SharePoint Site" "Collects ARC TRE requests through forms and records them in a SharePoint list." "Existing System" {

            treForms = container "Request Forms" "Provides the forms researchers use to request ARC TRE services." "Microsoft Forms"

            treFlows = container "Request Workflows" "Processes form submissions and records them as list items." "Microsoft Power Automate"

            treList = container "Request List" "Stores ARC TRE requests." "Microsoft SharePoint Lists" "Data Store"

            treSharePoint.treForms -> treSharePoint.treFlows "Triggers"

            treSharePoint.treFlows -> treSharePoint.treList "Writes requests to"
        }

        // Explicit system-level summaries precede detailed relationships.

        user -> portal "Manages studies, projects, training and agreements using" "HTTPS"

        igOps -> portal "Reviews studies and manages users' training and invitations using" "HTTPS"

        treOps -> portal "Approves TRE projects and manages ARC TRE API tokens using" "HTTPS"

        dshOps -> portal "Views DSH projects and manages Data Safe Haven API tokens using" "HTTPS"

        admin -> portal "Develops and maintains, without managing supported services in," "HTTPS"

        dshOps -> myServices "Executes requests made in" "HTTPS"

        portal -> entra "Authenticates users and looks up, invites and emails users through" "OpenID Connect; Microsoft Graph API"

        portal -> myServices "Creates requests in" "HTTPS/REST"

        tre -> portal "Fetches TRE projects and approved researcher status from and reports deployment status to" "HTTPS/REST and JSON"

        dsh -> portal "Fetches approved studies and researchers from and imports share members into" "HTTPS/REST, JSON and CSV"

        uclSystem -> portal "Fetches and updates its platform's projects through" "HTTPS/REST and JSON"

        aws -> portal "Hosts the ARC Services Portal"

        user -> igSharePoint "Registers studies, onboards and updates cases using" "HTTPS"

        user -> treSharePoint "Requests ARC TRE services using" "HTTPS"

        user -> myServices "Requests Data Safe Haven projects using" "HTTPS"

        treOps -> treSharePoint "Executes requests made in" "HTTPS"

        treOps -> tre "Implements ARC TRE requests in"

        igSharePoint -> m365Messaging "Sends notifications and approval requests through"

        m365Messaging -> igSharePoint "Returns approval responses to"

        igSharePoint -> dsh "Provides group access data to"

        // Detailed Portal access

        user -> portal.nginx "Opens the Portal in a browser through" "HTTPS"

        user -> portal.webFrontend.pages "Manages studies, projects, training and agreements using" "HTTPS"

        igOps -> portal.webFrontend.pages "Reviews studies and manages users' training and invitations using" "HTTPS"

        treOps -> portal.webFrontend.pages "Approves TRE projects and manages ARC TRE API tokens using" "HTTPS"

        dshOps -> portal.webFrontend.pages "Views DSH projects and manages Data Safe Haven API tokens using" "HTTPS"

        admin -> portal.webFrontend.pages "Develops, tests and supports, without managing supported services in," "HTTPS"

        // Identity integrations

        portal.oauth2Proxy -> entra "Authenticates Portal users through" "OpenID Connect and OAuth 2.0"

        portal.api.entraClient -> entra "Looks up users, sends guest invitations and sends email through" "Microsoft Graph API"

        // Service management integrations

        portal.api.myServicesClient -> myServices "Creates requests in" "HTTPS/REST and JSON"

        // Platform integrations

        tre -> portal.nginx "Sends /tre/api requests to" "HTTPS/REST and JSON; HTTP Basic or JWT bearer token"

        dsh -> portal.nginx "Sends /dsh/api requests to" "HTTPS/REST and JSON; JWT bearer token"

        uclSystem -> portal.nginx "Sends platform API requests to" "HTTPS/REST and JSON; JWT bearer token"

        // Delivery and hosting

        portal.deploy.gha_portal -> ghcr "Pushes container images to" "OCI Registry API"

        portal.deploy.tf -> aws "Provisions the Portal's Kubernetes resources and S3 buckets in" "Terraform AWS and Kubernetes providers"

        portal.deploy.tf -> ghcr "References Portal container images published to"

        aws -> ghcr "Pulls Portal container images from" "OCI Registry API"

        // Cross-cutting plumbing is recorded but not drawn.
        // portal.api -> aws "Sends application logs to"

        // Detailed as-is SharePoint flows

        user -> igSharePoint.igPowerApps "Registers studies, onboards and updates cases using" "HTTPS"

        user -> treSharePoint.treForms "Requests ARC TRE services using" "HTTPS"

        treOps -> treSharePoint.treList "Picks up ARC TRE requests from" "HTTPS"

        igSharePoint.igFlows -> m365Messaging "Sends notifications and approval requests through"

        m365Messaging -> igSharePoint.igFlows "Returns approval responses to"

        igOps -> m365Messaging "Approves study and onboarding requests through"

        igSharePoint.igLists -> dsh "Provides group access data to"

        // Confirm whether the TRE SharePoint request workflows also notify staff through Teams or Outlook
        // before adding that relationship.
    }

    views {

        systemContext portal "C1-Portal-Context" {
            include user
            include igOps
            include treOps
            include dshOps
            include admin
            include portal
            include entra
            include myServices
            include tre
            include dsh
            include uclSystem
            include aws
            exclude "user -> myServices"
            exclude "treOps -> tre"
            // autoLayout lr
            title "ARC Services Portal: System Context"
            description "Shows the people who use the ARC Services Portal and the systems it integrates with; the delivery pipeline's container registry is omitted."
        }

        container portal "C2-Portal-Containers" {
            include *
            exclude portal.deploy
            exclude aws
            exclude ghcr
            exclude "user -> myServices"
            exclude "treOps -> tre"
            // autoLayout lr
            title "ARC Services Portal: Containers"
            description "Shows the containers that make up the ARC Services Portal at runtime, the people who use them and the systems they integrate with; the delivery pipeline is shown in its own view."
        }

        container portal "C2-Portal-Platform-Integrations" {
            include user
            include treOps
            include dshOps
            include tre
            include dsh
            include uclSystem
            include portal.nginx
            include portal.oauth2Proxy
            include portal.webFrontend
            include portal.api
            include portal.postgres
            exclude "treOps -> tre"
            // autoLayout lr
            title "ARC Services Portal: Platform Integrations"
            description "Shows how ARC platforms reach the Portal API alongside browser users; the ARC TRE and Data Safe Haven are current integrations and Other UCL System stands for a newly onboarded platform."
        }

        component portal.api "C3-API-Components" {
            include *
            // autoLayout lr
            title "ARC Services Portal: API Components"
            description "Shows the components inside the API, how requests reach them and the data stores and external systems they use."
        }

        component portal.api "C3-API-Platform-Integration" {
            include portal.nginx
            include portal.api.middleware
            include portal.api.trehttpHandlers
            include portal.api.dshhttpHandlers
            include portal.api.otherhttpHandlers
            include portal.api.tokenService
            include portal.api.userService
            include portal.api.studyService
            include portal.api.projectService
            include portal.postgres
            include tre
            include dsh
            include uclSystem
            // autoLayout lr
            title "ARC Services Portal: API Platform Integration"
            description "Shows the API components a platform integration touches, from token verification to the project service; web handlers and integration clients are omitted."
        }

        component portal.webFrontend "C3-Web-Frontend-Components" {
            include *
            // autoLayout lr
            title "ARC Services Portal: Web Frontend Components"
            description "Shows the pages and the generated web API client inside the web frontend."
        }

        component portal.deploy "C3-Delivery-Pipeline-Components" {
            include *
            // autoLayout lr
            title "ARC Services Portal: Delivery Pipeline Components"
            description "Shows how GitHub Actions workflows in the Portal and infrastructure repositories build and deploy the Portal with Terraform."
        }

        container igSharePoint "C2-IG-SharePoint-Portal-Containers" {
            include *
            include igOps
            // autoLayout lr
            title "IG Advisory SharePoint Portal: As-Is Containers"
            description "Shows the PowerApps, Power Automate flows and SharePoint lists of the as-is IG Advisory portal, and how IG Ops approve requests through Teams and Outlook."
        }

        container treSharePoint "C2-TRE-SharePoint-Site-Containers" {
            include *
            include treOps
            include tre
            // autoLayout lr
            title "TRE SharePoint Site: As-Is Containers"
            description "Shows the forms, flows and list of the as-is ARC TRE request site, and how TRE Ops pick up requests and implement them in the TRE."
        }

        systemLandscape "IG-Portals-As-Is-Landscape" {
            include user
            include igOps
            include igSharePoint
            include treSharePoint
            include treOps
            include dshOps
            include myServices
            include m365Messaging
            include dsh
            // autoLayout lr
            title "IG SharePoint Portals: As-Is Landscape"
            description "Shows the as-is SharePoint-based IG and TRE portals, the MyServices route for DSH requests and the Ops teams who execute requests; the ARC Services Portal is omitted."
        }

        styles {

            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }

            element "Software System" {
                shape roundedbox
                background #1168bd
                color #ffffff
            }

            element "Container" {
                shape roundedbox
                background #438dd5
                color #ffffff
            }

            element "Component" {
                shape roundedbox
                background #85bbf0
                color #000000
            }

            element "Existing System" {
                background #666666
                color #ffffff
            }

            element "External System" {
                background #777777
                color #ffffff
            }

            element "Database" {
                shape cylinder
            }

            element "Data Store" {
                shape cylinder
            }

            element "Project Plane" {
                background #6b4c9a
                color #ffffff
            }

            element "Group:Amazon EKS cluster" {
                color #d86613
            }

            relationship "Relationship" {
                color #707070
                thickness 2
            }
        }
    }
}
