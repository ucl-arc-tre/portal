## Table of Contents

1. [Executive Summary](#1-executive-summary)
   - [Context](#11-context)
2. [Options](#2-options)
   - [Option 1](#21-option-1)
   - [Option 2](#22-option-2)
   - [Option 3](#23-option-3)
3. [Evaluation](#3-evaluation)
   - [Analysis and Recommendation](#31-analysis-and-recommendation)

## 1. Executive Summary

The ARC Services Portal (Portal) aims to replace the Sharepoint portal (SP) for IG management of user accounts, i.e. their approved researcher status, IG management of Studies and their related entities (Contracts & Assets). This management includes adding and maintaining documents as well as housing the process for requesting new Studies and user accounts. Once the Portal has the functionality to support the core actions of SP, the data in SP will need to be migrated, this paper outlines those options.

3 options are considered in this paper:

1. **Option 1:** **Migrate Incrementally** splitting out Users (Approved Researchers), Studies (including Assets and Contracts) and Projects into different phases.

2. **Option 2:** **Migrate Incrementally** splitting out Users (Approved Researchers) and Studies (including Assets, Contracts & Projects) into different phases.

3. **Option 3:** **Big Bang** wherein Users (Approved Researchers), Studies (including Assets and Contracts) and Projects are all done in one phase.

### 1.2 Context

- Users (Approved Researchers) refers to managing the status of individuals based on valid NHS training. Migration of users involves creating accounts for them on the Portal and adding them to the UCL Entra tenant
- Studies refers to the top level Study entity and associated Contract and Asset children. Migration of Studies involves recreating the Studies in the Portal with the relevant Asset records and any Contract documents
- Projects refers to the management of TRE and DSH user access and roles. This varies by the Environment (TRE/DSH) and has different APIs. Migration of this involves reading of user access and roles from the Environment to display in the Portal

## 2. Options

> [!NOTE]
>
> - All options will realistically take the same amount of time, but the perceived amount of time for the migration will vary (for users). Comms should include signposting on MyServices that the functionality will be moving to Portal, regardless of phased or not.
> - Project management is done in the environments and MyServices, the Portal will not be taking on this management, but will aim to reduce user traffic to MyServices

### 2.1 Option 1

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate incrementally, splitting into 3 phases: Users, Studies and Projects. Each phase would have an initial test group (TRE) to check functionality                                                                                                                                                                                                     |
| **Benefits**           | - Agile; smaller chunks are more manageable<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong                                                                                                                                                                                                                          |
| **Risks & Issues**     | - Users will have a period of using the Portal (researcher status) + SP (study management) + Env/myservices (project management) concurrently; may be confusing<br>- Spread of/multiple comms to the same user groups <br>- will probably feel the longest to users since development will continue before all phases complete; longest transition period |
| **UX Impact**          | Users will have the opportunity to get more used to the Portal whilst still having more familiar flows <br> - SP turned read-only after phase 2 <br>- users shift from SP + Env + MyServices -> Portal + SP + Env + MyServices -> Portal + Env + MyServices -> Portal + Env                                                                               |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                                                           |

### 2.2 Option 2

| **Section**            | **Description**                                                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate incrementally, splitting into 2 phases: Users & Studies. Each phase would have an initial test group (TRE) to check functionality                                                                                                                                                             |
| **Benefits**           | - Agile; smaller chunks are more manageable<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong <br>- fewer comms                                                                                                                                                    |
| **Risks & Issues**     | - Users will have a period of using the Portal (researcher status) + SP (study management) + Env/myservices (project management) concurrently; may be confusing<br>- Spread of/multiple comms to the same user groups <br>- longest delay between phases to bring Project functionality to completion |
| **UX Impact**          | Users will have the opportunity to get more used to the Portal whilst still having more familiar flows <br> - SP turned read-only after phase 2 <br>- users shift from SP + Env + MyServices -> Portal + SP + Env + MyServices -> Portal + Env                                                        |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                       |

### 2.3 Option 3

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate in one fell swoop: big bang                                                                                                                                                                                                                                                                                                                      |
| **Benefits**           | - Shortest transition period for users<br>- Fewest comms, fewest concurrent platforms                                                                                                                                                                                                                                                                    |
| **Risks & Issues**     | - Not as easy to handle mishaps<br>- Smallest opportunity for live testing <br>- Biggest delay before starting; can fall into the trap of "never being ready" <br>- slightly harder to judge when to send comms out so they feel relevant & have impact without being annoying but also not giving too short notice <br>- highest pressure on good comms |
| **UX Impact**          | Users will be given clear indication of where to manage their Researcher status and Studies and Projects but the least amount of time to adjust to the new places <br> - SP turned read-only after completion <br>- users shift from SP + Env + MyServices -> Portal + Env                                                                               |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                                                          |

## 3. Evaluation

### 3.1 Analysis and Recommendation

[tbd after some discussion/feedback?]
