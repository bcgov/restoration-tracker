import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectGeneralInformationForm } from 'features/projects/components/ProjectGeneralInformationForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { IProjectPermitForm } from 'features/projects/components/ProjectPermitForm';

export type ProjectForm = IProjectCoordinatorForm &
  IProjectPermitForm &
  IProjectGeneralInformationForm &
  IProjectObjectivesForm &
  IProjectLocationForm &
  IProjectIUCNForm &
  IProjectFundingForm &
  IProjectPartnershipsForm;
