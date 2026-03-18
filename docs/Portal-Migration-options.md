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

The ARC Services Portal (Portal) aims to replace the Sharepoint portal (SP) for IG activities and management of user accounts, i.e. their approved researcher status, management of Studies and their related entities (Contracts & Assets). This management includes adding and maintaining documents as well as housing the process for creating new Studies and user accounts. Once the Portal has the functionality to support the core actions of SP, the data in SP will need to be migrated. This paper outlines the options for this migration with a focus on user experience.

3 options are considered in this paper:

1. **Option 1:** **Migrate Incrementally** splitting out Users (Approved Researchers), Studies (including Assets and Contracts) and Projects into three different phases.

2. **Option 2:** **Migrate Incrementally** splitting out Users (Approved Researchers) and Studies and Projects (including Assets, Contracts) into two different phases.

3. **Option 3:** **Big Bang** wherein Users (Approved Researchers), Studies (including Assets and Contracts) and Projects are all done in one phase.

### 1.2 Context

- Users (Approved Researchers) refers to managing the status of individuals based on valid NHS Data Security Awareness training. Migration of users involves creating accounts for them on the Portal, and adding them to the UCL Entra tenant where necessary (as is the case for external collaborators with DSH accounts)
- Studies refers to the top level Study entity and associated Contract and Asset children. Migration of Studies involves recreating the Studies in the Portal with the relevant Asset records and any Contract documents
- Projects refers to the management of TRE and DSH user access and roles. This varies by the Environment (TRE/DSH) and has different APIs. Migration of this involves reading of user access and roles from the Environment to display in the Portal

## 2. Options

> [!NOTE]
>
> - All options will realistically take the same amount of time, but the perceived amount of time for the migration will vary (for users). Comms should include signposting on MyServices that the functionality will be moving to Portal, regardless of phased or not.
> - Project management is done in the environments and MyServices, the Portal will not be taking on this management, but will aim to reduce user traffic to MyServices

## 2.1 Option 1

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate incrementally, splitting into 3 phases: Users, Studies and Projects. Each phase would have an initial test group (TRE) to check functionality                                                                                                                                                                        |
| **Benefits**           | - Agile; smaller chunks are more manageable<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong <br>- Users get better experience more quickly                                                                                                                                              |
| **Risks & Issues**     | - Users will (continue to, in the case of TRE) have a period of using the Portal (researcher status) + SP (study management) + Env/myservices (project management) concurrently; may be confusing <br>- Will feel the longest to users since development will continue before all phases complete; longest transition period |
| **UX Impact**          | Users will have the opportunity to get more used to the Portal whilst still having more familiar flows <br> - SP turned read-only after phase 2 <br>- users shift from SP + Env + MyServices -> Portal + SP + Env + MyServices -> Portal + Env + MyServices -> Portal + Env (+ MyServices optionally)                                                   |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                              |

## 2.2 Option 2

| **Section**            | **Description**                                                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate incrementally, splitting into 2 phases: Users, and Studies & Projects. Each phase would have an initial test group (TRE) to check functionality                                                                                                                                                             |
| **Benefits**           | - Agile; smaller chunks are more manageable<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong                                                                                                                                                  |
| **Risks & Issues**     | - Users will have a period of using the Portal (researcher status) + SP (study management) + Env/myservices (project management) concurrently; may be confusing<br>- Spread of/multiple comms to the same user groups <br>- longest delay between phases to bring Project functionality to completion |
| **UX Impact**          | Users will have the opportunity to get more used to the Portal whilst still having more familiar flows <br> - SP turned read-only after phase 2 <br>- users shift from SP + Env + MyServices -> Portal + SP + Env + MyServices -> Portal + Env (+ MyServices optionally)                                                            |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                       |

### Notes



## 2.3 Option 3

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate in one fell swoop: big bang                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Benefits**           | - Shortest transition period for users<br>- Fewest concurrent platforms for users                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Risks & Issues**     | - Not as easy to handle mishaps; very few people (~2) to address tickets<br>- Likely to block research in the case of mishaps<br>- Smallest opportunity for live testing <br>- Biggest delay before starting; can fall into the trap of "never being ready" <br>- slightly harder to judge when to send comms out so they feel relevant & have impact without being annoying but also not giving too short notice <br>- highest pressure on good comms <br>- relies more heavily on testing prior to implementation |
| **UX Impact**          | Users will be given clear indication of where to manage their Researcher status and Studies and Projects but the least amount of time to adjust to the new places <br> - SP turned read-only after completion <br>- users shift from SP + Env + MyServices -> Portal + Env (+ MyServices optionally)                                                                                                                                                                                                                                           |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### Other Notes/Considerations

We'll need to do rebranding at some point, when would be a good point?

Under Options 1 & 2:
- Existing IAOs/IAAs and DSH share members will not notice a difference during the User phase until their training expires and they have to upload a new certificate.
- Existing IAOs/IAAs will be the only people to notice the second phase (the Studies or Studies & Projects phase), since they are the only people who use the SP for Study Management.
- In Option 2, the pain of having to use 1) the Portal for user management, 2) the SP for Study Management, and 3) MyServices/TRE forms for project requests will be confined to the time after the User phase is complete but before the Studies & Projects phase is complete.
- Optoins 2 and 3 will share MyServices as a route for DSH users to request new shares. Even in the "big bang" aproach of Option 3, we will not remove the possibility of managing DSH shares through MyServices.

## 3. Evaluation

### 3.1 Analysis and Recommendation

[tbd after some discussion/feedback?]