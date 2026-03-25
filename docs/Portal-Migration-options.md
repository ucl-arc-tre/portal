## Table of Contents

1. [Executive Summary](#1-executive-summary)
   - [Context](#11-context)
   - [Complexity](#12-managing-the-complexity-of-having-one-portal-and-two-tres)
2. [Analysis](#2-options)
   - [Option 1](#21-option-1)
   - [Option 2](#22-option-2)
   - [Option 3](#23-option-3)
   - [Option 4](#24-option-4)
3. [Evaluation](#3-evaluation)

## 1. Executive Summary

The ARC Services Portal (the Portal) aims to replace the Information Governance Sharepoint portal (the SP) as the primary platform for UCL's research community to conduct Information Governance activities and management of sensitive research data (and  metadata relating to its storage and processing). These activities include adding and maintaining records and documents through the creation of "Studies" and the creation of "Approved Researchers", which are handled by the SP currently. Additionally, the SP contains a mirror of project data from the Data Safe Haven, allowing Project owners to view their project configuration and access lists. Once the Portal has the functionality to support the core actions of SP, plus enhanced Project management actions, the User and Study data in SP will need to be migrated (and Project data needs to be pushed into the Portal instead of the SP). This paper outlines the options for this migration with a focus on user experience.

4 options are considered in this paper:

1. **Option 1:** **Migrate Incrementally** splitting out Users (Approved Researchers), Studies (including Assets and Contracts) and Projects into three different phases.

2. **Option 2:** **Migrate Incrementally** splitting out Users (Approved Researchers) and Studies and Projects (including Assets, Contracts) into two different phases.

3. **Option 3:** **Migrate TRE First** the order of the TRE migration TBC, the DSH to follow suit.

4. **Option 4:** **Big Bang** wherein Users (Approved Researchers), Studies (including Assets and Contracts) and Projects are all done in one phase.

Following the reasoning laid out in full in the [Evaluation](#3-evaluation) section, **Option 3:** **Migrate TRE First** is recommended.

### 1.1 Context

- Users (Approved Researchers) refers to managing the status of individuals based on valid NHS Data Security Awareness training. Migration of users involves creating accounts for them on the Portal, and adding them to the UCL Entra tenant where necessary (as is the case for external collaborators with DSH accounts)
- Studies refers to the top level Study entity and associated Contract and Asset children. Migration of Studies involves recreating the Studies in the Portal with the relevant Asset records and any Contract documents
- Projects refers to the management of TRE and DSH user access and roles. This varies by the Environment (TRE/DSH) and has different APIs. Migration of this involves reading of user access and roles from the Environment to display in the Portal

### 1.2 Managing the complexity of having one Portal and two TREs 

Of any statement about this data migration, you can reasonably ask the question "are we talking about the DSH or TRE? Or both?". There is some complexity since not only are we talking about three core processes - User onboarding, Study management, and Project management - we're talking about those three processes across the two environments, effectively creating a 2x3 matrix of components:

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

Fully migrating TRE users first, then following with the remaining DSH-only users:

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
| User onboarding   |     :x: (SharePoint)          |   :white_check_mark: |
| Study mgmt.          |     :x: (SharePoint)          |   :white_check_mark:               |
| Project mgmt.        |     :x: (MyServices)          |   :white_check_mark:               |

</div>

<p align="center">Once this migration of TRE-only users has exposed any large issues or bugs</p>

<p align="center">:arrow_down:</p>
<div align="center">

| Portal function      |    DSH            |      TRE             |
|----------------------|-------------------|----------------------|
| User onboarding   |     :white_check_mark:          |   :white_check_mark: |
| Study mgmt.          |     :white_check_mark:          |   :white_check_mark:               |
| Project mgmt.        |     :white_check_mark:          |   :white_check_mark:               |

</div>

### Option 4

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
> - Whilst this options paper is considering the question of how to sequence the migration of groups of data from one datastore to another, the answers lie as much in the correct functioning of the portal once the data has been successfully migrated into its database. It seems most likely that the reason we may need to rollback would be because of broken portal functionality, rather than issues with getting data into the portal DB i.e. the migration itself.

## 2.1 Option 1

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | - Migrate incrementally, splitting into 3 phases: Users (1), Studies (2) and Projects (3)<br> - Each phase would have an initial test group (TRE users/studies/projects) to check functionality<br> - SP turned read-only after phase 2                                                                                                                                                                        |
| **Benefits**           | - Agile: smaller chunks are more manageable for the portal team<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong<br>- Users get better experience more quickly                                                                                                                                              |
| **Risks & Issues**     | - Users will (continue to, in the case of TRE) have a period of using the Portal (researcher status) + SP (study management) + Env/MyServices (project management) concurrently. This may be confusing <br>- Will feel the longest to users since development will continue before all phases complete; longest transition period<br>- Using TRE users as the initial test group in each phase may be slightly slightly ineffective: it may test only trivial cases and exclude the complex edge cases where the true migration risk sits i.e. large and complex existing DSH Studies.  |
| **UX Impact**          | - Users will have the opportunity to become familiar with the Portal in phase 1, whilst still being able to do the more complex Study management activities in SP until phase 2 is done<br>- Users have multiple steps of small change, increasing the amount of time where they have to use multiple platforms to onboard to any DSH/TRE services                                                  |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                              |

## 2.2 Option 2

| **Section**            | **Description**                                                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | - Migrate incrementally, splitting into 2 phases: Users (1), and Studies & Projects (2). Each phase would have an initial test group (TRE users) to check functionality<br> - SP turned read-only after phase 2                                                                                                                                                             |
| **Benefits**           | - Agile: smaller chunks are more manageable for the Portal team<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong<br>- Allows decoupling of Studies and Projects, giving portal dev team more time to develop the DSH API and project data import functionality                                                                                                                                                 |
| **Risks & Issues**     | - Users will have a period of using the Portal (researcher status) + SP (study management) + Share Manager/MyServices (project management) concurrently. This may be confusing<br>- Spread of/multiple comms to the same user groups<br>- May be long delay after Study phase to bring Project functionality to completion<br>- Using TRE users as the initial test group in each phase may be slightly slightly ineffective: it may test only trivial cases and exclude the complex edge cases where the true migration risk sits i.e. large and complex existing DSH Studies. |
| **UX Impact**          | - Users will have the opportunity to become familiar with the Portal in phase 1, whilst still being able to do the more complex Study management activities in SP until phase 2 is done<br> - Still split across 3 platforms for a time                                                            |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                       |




## 2.4 Option 3

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | - Migrate all TRE users first, then migrate DSH users<br>- Sequence of migration for TRE and then DSH TBC                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Benefits**           | - Smaller chunks are more manageable for the Portal team<br>- Allows TRE to decommission the TRE SharePoint soon<br>- Easier to respond to mishaps<br>- Fewer people affected if something goes wrong                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Risks & Issues**     | - Requires repeated phases of manual data migration<br>- Begs the question about the sequence of migration: ought it be phased or a big bang for TRE? And then phased or big bang for DSH users?<br>- No single source of truth for Studies, Assets, Contracts, Approved Researchers |
| **UX Impact**          | - Users will be split into "TRE" and "DSH" groups. There are many TRE users who are also DSH users: for these people, they will have to manage all their Studies in the Portal<br>- Each tranche of Users go from 3 potential platforms to 1 immediately (with the option to continue using MyServices to make DSH requests)                                                                                                                                                                                                                                           |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## 2.3 Option 4

| **Section**            | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option Description** | Migrate in one fell swoop: big bang                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Benefits**           | - Shortest transition period for users<br>- Fewest concurrent platforms for users<br>- SP turned read-only at beginning of migration sequence                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Risks & Issues**     | - Not as easy to handle mishaps; very few people (~2) to address tickets<br>- Biggest delay before starting; can fall into the trap of "never being ready"<br>- Highest pressure on good comms <br>- Relies more heavily on testing prior to implementation |
| **UX Impact**          | - Users will be given clear indication of where to manage their Researcher status and Studies and Projects but the least amount of time to adjust to the new places<br>- Users go from 3 potential platforms to 1 immediately (with the option to continue using MyServices to make DSH requests)                                                                                                                                                                                                                                           |
| **Option Score (1-5)** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### Other Notes/Considerations

We'll need to do rebranding at some point.

Under Options 1, 2 and 3:
- Existing IAOs/IAAs and DSH share members will only notice a difference during the User phase when their training expires and they have to upload a new certificate.
- Existing IAOs/IAAs will be the only people to notice the second phase (the Studies or Studies & Projects phase), since they are the only people who use the SP for Study Management.
- In Option 2, the pain of having to use 1) the Portal for user management, 2) the SP for Study Management, and 3) MyServices/TRE forms for project requests will be confined to the time after the User phase is complete but before the Studies & Projects phase is complete.
- IAOs will have no way of inviting externals to register on the Portal, because they will not have the role necessary for that action until Studies are migrated.

All Options will share MyServices as a route for DSH users to request new shares. Even in the "big bang" approach of Option 4, we will not remove the possibility of managing DSH shares through MyServices.

## 3. Evaluation

First thoughts: Option 4 is conceptually the cleanest from a UX perspective and should be the one we would pick in an ideal word: users would receive comms in advance, informing them of a period of a few days of downtime e.g. Monday & Tuesday for the SP portal. All being well, they could log in to the new Portal on Wednesday morning and see all of their Studies, with associated Assets and Contracts, and all of their Projects. Assuming no functionality breaks or has debilitating bugs, IAO/IAAs could create new Studies and Projects, or edit existing ones, and internal and external users would have a new Profile page on which they can upload in-date training certificates whenever their 12-month coverage expires. The Project page routes validated service requests direct to the TRE/Environment team for swift execution. Daily updates reflect executed requests on the Projects page. This scenario beats all others which involve using the Portal for some actions, the old SP for others, and MyServices for others still (although, in any case, DSH service request forms will remain available to any UCL users in MyServices for some time after the Portal also has Project functionality live).

We should start here i.e. at Option 4, and moderate down the list of preferences in light of practical limitations or capacity concerns.

### What could go wrong?

What could go wrong in Option 4 that wouldn't go wrong in Option 1, Option 2 or Option 3? 
1. If the Portal's UserS functionality goes wrong in Option 4, then, on the assumption that we don't ship features until we're satisfied they are robust, the same thing would probably also go wrong in Options 1, 2 and 3. This could be:
  - Major problems with the import such that some (random subset of) approved researchers are not recorded in the portal DB, so then don't show up in the people search or in the lookup when someone is trying to add them to a Project. **We can thoroughly test this.**
  - Problems with adding external users in particular to the portal. This seems more likely since the process is lengthier and there is more room for things to go wrong i.e. invitations to Entra not being sent, or being sent but not accepted, or being sent and accepted but then not being discoverable, as in the point above. **We can thoroughly test this.**

But whereas in Options 1, 2 and 3 this would be the sole set of problems to triage and fix, in Option 4 the Portal team could also be having to deal with Study and/or Project-related problems:

2. Study problems. As with before, if the migration of Study management to the Portal goes wrong in Option 4, then it would probably also go wrong in Options 1, 2 and 3 - but in Option 4 other things could also be going wrong simultaneously, reducing the capacity of the team to fix the Study problems, which could be:
  - Studies being uneditable (i.e. the form to edit works but submission of it fails, perhaps due to validation issues)
  - Studies receiving the wrong status on import (we want Studies that are Approved in SP to retain their Approved Status, even if they would not pass muster if they were requested today) such that new Projects can't be created under the Study or existing ones effectively managed.
  - Studies not being visible to their owners at all (they may in fact exist in the DB, just not visible via the Study page - they may or may not still be visible to the Project form's Study lookup field)

  **We can test all of this thoroughly.**

3. Project problems. This is twofold, since projects need to be visible, editable, and creatable in the frontend by users, **and** the DSH environment team need to be able to GET and PATCH project records via API. As above, on the assumption that we don't ship features until we're satisfied they are robust, if any Project functionality breaks following an Option 4 "big bang" migration, be it in the frontend or backend, the same thing would probably also break in Options 1, 2 and 3. Possible problems include:
  - Project forms not being able to lookup eligible Studies and Users (Approved Researchers).
  - Project request/updates made in the Portal do not successfully create validated MyServices tickets in the DSH or TRE Ops teams' inboxes.
  - The DSH POST endpoints or the portal frontend fail in some way such that accurate project data from the daily updates from the DSH are not displayed in the Portal

### Why not do a Blue/Green deployment?

A Blue/Green deployment is not viable on account of:
- Incompatible database systems
  - The existing system relies on SharePoint lists, whereas the new system uses PostgreSQL.
  - Blue/green deployment assumes that the new version can operate alongside the old version using the same production data and database, enabling instant traffic switching. In this case, the old environment cannot communicate with Postgres, nor can the new environment interact with SharePoint lists, making instantaneous switching impossible.
- Different application stacks and architectures
  - Blue/green deployment requires “identical” environments, where all infrastructure, configuration, and external dependencies etc. are the same, and only the application code differs. This condition is not met here: the environments are not interchangeable, and the new application cannot simply replace the old one without data migration and user adaptation.

### Why not do a Canary deployment?

A Canary deployment, whilst certainly more viable than Blue/Green, would involve:
- Migrating the Study data of small groups of users at a time
- Making these groups' existing SharePoint records read-only the moment they have access to the Portal
- Exposing the Portal to a this subset of users
- Monitoring behavior, fixing any issues, then expanding gradually to the next group

Options 1, 2 and 3 involve this to an extent (insofar as they each suggest using the ARC TRE's users as early pilot users (Canaries) for the Portal)

What is intensive/difficult (at scale) about this approach is revoking edit access to these users' existing SP records (i.e. making their existing records read-only). Obviously we do not want to allow users to edit ostensibly the same data in two places, so the Study-level SharePoint groups which govern access to SharePoint records will have to be emptied (once a copy has been made of the full set of group membership at the point of switchover). Any rollback plan under this approach will necessitate manually adding all members back into these SharePoint groups. Furthermore, once users begin writing data to the Portal DB, persisting this new data through a rollback would require complex synchronization back to SharePoint, which is practically impossible.

> [!NOTE] 
> For all options, regarding rollback:
>- Rollback is non-trivial: once users begin writing data to the Portal DB, reverting to the old system and persisting this new data would require complex synchronization back to SharePoint, which is practically impossible.

### Development and testing time

Developer-time is a constrained resource in the Portal team, and in particular, the development of the Project management functions for both DSH and ARC TRE Projects, which share a set of features, but also differ a lot in implementation, require a significant amount of work. In order to do Option 4, a large amount of development work still needs to be undertaken. The risk that this would take more than one term is high. And that is ignoring for the moment the thorough testing which we would need to conduct in preparation for a "big bang" deployment. 

As a result of these constraints, Option 3 (TRE users/studies migrated first) appears to be the best option. It allows us to roll out the new Portal's Study and Project management features to a smaller subset of users, which limits the blast radius of any catastrophic downtime, but also allows for more effective management of what's most likely to be a modest stream of bug reports/requests for help that will come from this smaller group of users. Option 3 thus allows the Portal team to continue development of the DSH Project management functionality at a steady rate, whilst also tending to any necessary fixes in the Study and TRE Project management functionality.

Option 3 also appears to effectively lower the risk of needing to rollback, which, as noted above, would be very suboptimal if it came to pass. 

### What questions still need answering?

We still need to answer the question of how the TRE Rollout will happen: Studies, and then Projects, or Studies and Projects together? And furthermore, after the TRE Rollout complete and stable, how will the DSH Rollout happen: in one big bang, or phased: and if phased, in how many phases?

By this point, however, having rolled out the full set of Portal functionality to TRE users, we ought to be better placed to make this decision. We will be armed with the knowledge of how the TRE Rollout went, and will know how confident we are in the robustness of the Portal's core functionality (in light of how many bugs/breaks were reported during the TRE Rollout).

We should also identify any groups within the "TRE users" group who seem too large, complex, or capacity-constrained to be among the vanguard group moving to the Portal. For example, the Centre for Longitudinal Studies is a complex research centre who have an active TRE Project, but their Study is among the largest and most complex of any in the SP. Do we want to exclude this group, and any others like it, from the initial TRE Rollout?