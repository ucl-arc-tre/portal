## Table of Contents

1. [Executive Summary](#1-executive-summary)
   - [Context](#11-context)
   - [Complexity](#12-managing-the-complexity-of-having-one-portal-and-two-tres)
2. [Analysis](#2-options)
   - [Option 1](#21-option-1)
   - [Option 2](#22-option-2)
   - [Option 3](#23-option-3)
3. [Evaluation](#3-evaluation)

## 1. Executive Summary

The ARC Services Portal (the Portal) aims to replace the Information Governance Sharepoint portal (SP) as the primary platform for UCL's research community to conduct Information Governance activities and management of sensitive research data (and  metadata relating to its storage and processing). These activities include adding and maintaining documents through the creation of "Studies", "Projects", and the creation of "Approved Researchers", which are mostly handled by the SP currently. Once the Portal has the functionality to support the core actions of SP, the data in SP will need to be migrated. This paper outlines the options for this migration with a focus on user experience.

3 options are considered in this paper:

1. **Option 1:** **Migrate Incrementally** splitting out Users (Approved Researchers), Studies (including Assets and Contracts) and Projects into three different phases.

2. **Option 2:** **Migrate Incrementally** splitting out Users (Approved Researchers) and Studies and Projects (including Assets, Contracts) into two different phases.

3. **Option 3:** **Big Bang** wherein Users (Approved Researchers), Studies (including Assets and Contracts) and Projects are all done in one phase.

### 1.1 Context

- Users (Approved Researchers) refers to managing the status of individuals based on valid NHS Data Security Awareness training. Migration of users involves creating accounts for them on the Portal, and adding them to the UCL Entra tenant where necessary (as is the case for external collaborators with DSH accounts)
- Studies refers to the top level Study entity and associated Contract and Asset children. Migration of Studies involves recreating the Studies in the Portal with the relevant Asset records and any Contract documents
- Projects refers to the management of TRE and DSH user access and roles. This varies by the Environment (TRE/DSH) and has different APIs. Migration of this involves reading of user access and roles from the Environment to display in the Portal

### 1.2 Managing the complexity of having one Portal and two TREs 

Of any statement about this data migration, you can reasonably ask the question "are we talking about the DSH or TRE here?". There is some complexity since not only are we talking about three core processes - User onboarding, Study management, and Project management - we're talking about those three processes across the two environments, effectively creating a 2x3 matrix of components:

<div align="center">

| Portal function      |    DSH         |      TRE       |
|----------------------|----------------|----------------|
| User onboarding      |                |                |
| Study mgmt.          |                |                |
| Project mgmt.        |                |                |

</div>

### Current state

Only the TRE already uses the Portal for user onboarding:

<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :x: (SharePoint)          |   :white_check_mark: |
| Study mgmt.          |     :x: (SharePoint)          |   :x: (SharePoint)               |
| Project mgmt.        |     :x: (MyServices)          |   :x: (SharePoint)               |

</div>

### Desired State

Project management for DSH shares will remain possible via MyServices tickets, and also inside the DSH directly using the Share Manager tool:

<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:          |   :white_check_mark: |
| Study mgmt.          |     :white_check_mark:          |   :white_check_mark:               |
| Project mgmt.        |     :white_check_mark: (+ MyServices + tool)          |   :white_check_mark:               |

</div>

The key question here is about the sequence in which we turn the :x:s into :white_check_mark:s:

### Option 1

In three distinct steps:

<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :x: (SharePoint)          |   :white_check_mark:             |
| Study mgmt.          |     :x: (SharePoint)          |   :x: (SharePoint)               |
| Project mgmt.        |     :x: (MyServices)          |   :x: (SharePoint)               |

</div>
<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:        |   :white_check_mark:             |
| Study mgmt.          |     :x: (SharePoint)          |   :x: (SharePoint)               |
| Project mgmt.        |     :x: (MyServices)          |   :x: (SharePoint)               |

</div>
<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:          |   :white_check_mark:           |
| Study mgmt.          |     :white_check_mark:          |   :white_check_mark:           |
| Project mgmt.        |     :x: (MyServices)            |   :x: (SharePoint)             |

</div>
<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:          |   :white_check_mark:           |
| Study mgmt.          |     :white_check_mark:          |   :white_check_mark:           |
| Project mgmt.        |     :white_check_mark: (+ MyServices)         |   :white_check_mark:           |

</div>

### Option 2

In two distinct steps:

<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :x: (SharePoint)          |   :white_check_mark:             |
| Study mgmt.          |     :x: (SharePoint)          |   :x: (SharePoint)               |
| Project mgmt.        |     :x: (MyServices)          |   :x: (SharePoint)               |

</div>
<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:        |   :white_check_mark:             |
| Study mgmt.          |     :x: (SharePoint)          |   :x: (SharePoint)               |
| Project mgmt.        |     :x: (MyServices)          |   :x: (SharePoint)               |

</div>

<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:          |   :white_check_mark:           |
| Study mgmt.          |     :white_check_mark:          |   :white_check_mark:           |
| Project mgmt.        |     :white_check_mark: (+ MyServices)         |   :white_check_mark:           |

</div>

### Option 3

Or in one "big bang":

<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :x: (SharePoint)          |   :white_check_mark:             |
| Study mgmt.          |     :x: (SharePoint)          |   :x: (SharePoint)               |
| Project mgmt.        |     :x: (MyServices)          |   :x: (SharePoint)               |

</div>

<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:          |   :white_check_mark:           |
| Study mgmt.          |     :white_check_mark:          |   :white_check_mark:           |
| Project mgmt.        |     :white_check_mark: (+ MyServices)         |   :white_check_mark:           |

</div>

## 2. Analysis

> [!NOTE]
>
> - Project management can't be moved into the portal before Study management, because it relies on lookups of Study data.
> - The sources of truth for project configuration and access control are inside the TRE systems themselves (i.e. as IaC or Active Directory config). Currently projects are managed by users either inside the TREs or through completing request forms in MyServices or SharePoint. **The Portal will not replace the TREs as the source of truth for this data**. It will, however, become the source of truth for User and Study data, i.e. who is an approved researcher, and what Studies (including assets and contracts) are approved or pending approval.

## 2.1 Option 1

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | - Migrate incrementally, splitting into 3 phases: Users, Studies and Projects<br> - Each phase would have an initial test group (TRE) to check functionality<br> - SP turned read-only after phase 2                                                                                                                                                                         |
| **Benefits**           | - Agile; smaller chunks are more manageable for portal team<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong <br>- Users get better experience more quickly                                                                                                                                              |
| **Risks & Issues**     | - Users will (continue to, in the case of TRE) have a period of using the Portal (researcher status) + SP (study management) + Env/MyServices (project management) concurrently; may be confusing <br>- Will feel the longest to users since development will continue before all phases complete; longest transition period<br>- Using TRE users as the initial test group in each phase may be slightly slighly ineffective: it may test only trivial cases and exclude the complex edge cases where the true migration risk sits i.e. large and complex existing DSH Studies.  |
| **UX Impact**          | - Users will have the opportunity to become familiar with the Portal whilst still having more familiar SP<br>- Users have multiple steps of small change, increasing the amount of time where they have to use multiple platforms to onboard to any DSH/TRE services                                                  |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                              |

## 2.2 Option 2

| **Section**            | **Description**                                                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate incrementally, splitting into 2 phases: Users (1), and Studies & Projects (2). Each phase would have an initial test group (TRE) to check functionality<br> - SP turned read-only after phase 2                                                                                                                                                             |
| **Benefits**           | - Agile; smaller chunks are more manageable for Portal team<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong<br>- Allows decoupling of Studies and Projects, giving portal dev team more time to develop the DSH API and project data import functionality                                                                                                                                                 |
| **Risks & Issues**     | - Users will have a period of using the Portal (researcher status) + SP (study management) + Share Manager/MyServices (project management) concurrently; may be confusing<br>- Spread of/multiple comms to the same user groups<br>- May be long delay after Study phase to bring Project functionality to completion<br>- Using TRE users as the initial test group in each phase may be slightly slighly ineffective: it may test only trivial cases and exclude the complex edge cases where the true migration risk sits i.e. large and complex existing DSH Studies. |
| **UX Impact**          | Users will have the opportunity to get more used to the Portal whilst still having more familiar flows<br> - Still split across 3 platforms for a time                                                            |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                       |


## 2.3 Option 3

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate in one fell swoop: big bang                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Benefits**           | - Shortest transition period for users<br>- Fewest concurrent platforms for users<br>- SP turned read-only after completion                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Risks & Issues**     | - Not as easy to handle mishaps; very few people (~2) to address tickets<br>- ~~Likely to block research in the case of mishaps~~<br>- ~~Smallest opportunity for live testing~~<br>- Biggest delay before starting; can fall into the trap of "never being ready"<br>- Highest pressure on good comms <br>- Relies more heavily on testing prior to implementation |
| **UX Impact**          | Users will be given clear indication of where to manage their Researcher status and Studies and Projects but the least amount of time to adjust to the new places<br>- Users go from 3 potential platforms to 1 immediately (with the option to continue using MyServices to make DSH requests)                                                                                                                                                                                                                                           |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### Other Notes/Considerations

We'll need to do rebranding at some point.

Under Options 1 & 2:
- Existing IAOs/IAAs and DSH share members will only notice a difference during the User phase when their training expires and they have to upload a new certificate.
- Existing IAOs/IAAs will be the only people to notice the second phase (the Studies or Studies & Projects phase), since they are the only people who use the SP for Study Management.
- In Option 2, the pain of having to use 1) the Portal for user management, 2) the SP for Study Management, and 3) MyServices/TRE forms for project requests will be confined to the time after the User phase is complete but before the Studies & Projects phase is complete.
- IAOs will have no way of inviting externals to register on the Portal, because they will not have the role necessary for that action until Studies are migrated.

- Options 2 and 3 will share MyServices as a route for DSH users to request new shares. Even in the "big bang" approach of Option 3, we will not remove the possibility of managing DSH shares through MyServices.

## 3. Evaluation

