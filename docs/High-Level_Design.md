# Portal HLD

## As-is Portal(s)

![As-is](./media/ARC_Portals_Current.drawio.svg)



Current portal is hosted in SharePoint with data related to cases (AKA studies) researchers etc. in several SharePoint lists. Users logon to the sharepoint portal and are able to see and update their existing cases and request new cases etc.

### Example forms and project list
[Register new Case/Study](https://liveuclac.sharepoint.com/sites/ISD.IGAdvisoryService/Lists/Start%20a%20service%20request/NewForm.aspx)

[View my projects](https://liveuclac.sharepoint.com/sites/ISD.IGAdvisoryService/Lists/Cases/Portal.aspx)

## To-be Portal

ARC would like to build a replacement portal to manage [key ISMS processes](https://github.com/UCL-ARC/research-data-isms/tree/main/docs/Controlled_Processes). This portal will be use the pathfinder project for ARC's metadata store based on 
[this design](https://github.com/UCL-ARC/metadata-store/blob/main/doc/specification.md).
Some process such as incident and service request will be managed through the "MyServices" (Xurrent) as per the pattern detailed [here in option 2](https://github.com/UCL-ARC/ARC-Strategy-and-Design/blob/main/Docs/Service_Design/ARC_Experience_and_Service_Platforms.md).

## Design Principles

Design will adhere to the [digital foundation principles](https://liveuclac.sharepoint.com/sites/it-architecture/SitePages/digital-foundation-principles.aspx).

Plus:

| Principle | Description | Implementation | Testing |
|------------|------------|----------------|----------|
|Reusable | The portal and underlying data structure will support a wide variety of use cases within ARC, initially focused on ARC services requiring similar functionality (EG. User onboarding) | Initially built around the TRE use case with input from the Research Computing and Research Data team to ensure designs support other use cases. | TBC
| Open Source | As much of the development should be made open source as possible with an output of the build being a design and code base. | TBC | TBC
| Master state data in the right pace | The state data of services and resources will remain mastered within platforms. This will include access control to resources and configuration of infrastructure. These state data will be read from the platforms (Such as TRE, RDP and Condenser) and processes managed within the portal may trigger changes in state within the platform. | TBC | TBC
| Retention of Quality Data | Where processes within the portal make changes to metadata or resources adequate quality data will be captured and retained in line with the requirements of any downstream system. | TBC | TBC

## Non-functional Requirements

### Data Classification

The portal and underlying data will be limited to storing confidential and public data.

### Availability

TBC

### Integrity

See above principle on quality data. 

## Definition of the MVP



## Conceptual data model

TBC - Initial model [here](https://github.com/UCL-ARC/metadata-store/blob/main/doc/specification.md#7-entity-relationship-er-logical-models)

## Application, database and integration design 

The portal and database will use the Experience Layers [here](https://github.com/UCL-ARC/ARC-Strategy-and-Design/blob/main/Docs/Service_Design/ARC_Experience_and_Service_Platforms.md#4-experience-layers).

The portal will align to [this design](https://github.com/UCL-ARC/ARC-Strategy-and-Design/blob/main/Docs/Service_Design/ARC_Experience_and_Service_Platforms.md#62-option-2---portal-only-workflows-recommended-option) option to support researchers acknowledging that service request will still be submitted and managed in MyServices.

The overall design will be based on [The UCL Experience Framework](https://liveuclac.sharepoint.com/sites/it-architecture/SitePages/EF-architecture-patterns.aspx) (Pattern 4).


