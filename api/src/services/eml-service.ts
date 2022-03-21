import jsonpatch from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';
import { IDBConnection } from '../database/db';
import project from '../queries/project';
import { ProjectObject, ProjectService } from './project-service';
import { DBService } from './service';

export const EML_VERSION = '1.0.0';
export const EML_PROVIDER_URL = '';
export const EML_SECURITY_PROVIDER_URL = '';
export const EML_ORGANIZATION_NAME = '';
export const EML_ORGANIZATION_URL = '';
export const EML_TAXONOMIC_PROVIDER_URL = '';
export const INTELLECTUAL_RIGHTS = '';

export type XmlLang = Record<string, unknown>;

export type XmlAttributes<T extends object> = { $: T };

export type EmlFile = {
  eml: EmlSection;
};

export type EmlSection = XmlAttributes<EmlSectionAttributes> & EmlSectionChildren;
export type EmlSectionAttributes = { packageId: string; system: string; scope?: string } & Partial<XmlLang>;
export type EmlSectionChildren = { access: AccessSection; citation: CitationSection; dataset: DatasetSection };

export type AccessSection = XmlAttributes<AccessSectionAttributes> & AccessSectionChildren;
export type AccessSectionAttributes = {
  authSystem: string;
  id?: string;
  order?: string;
  scope?: string;
  system?: string;
};
export type AccessSectionChildren = Record<string, unknown>;

export type CitationSection = XmlAttributes<CitationSectionAttributes> & CitationSectionChildren;
export type CitationSectionAttributes = {
  id?: string;
  system?: string;
  scope?: string;
};
export type CitationSectionChildren = Record<string, unknown>;

export type DatasetSection = XmlAttributes<DatasetSectionAttributes> & DatasetSectionChildren;
export type DatasetSectionAttributes = { id?: string; system?: string; scope?: string };
export type DatasetSectionChildren = Record<string, unknown>;

export type AdditionalMetaDataSection = XmlAttributes<AdditionalMetaDataSectionAttributes> &
  AdditionalMetaDataSectionChildren;
export type AdditionalMetaDataSectionAttributes = { id?: string };
export type AdditionalMetaDataSectionChildren = Record<string, unknown>;

export class EmlService extends DBService {
  data: Record<any, any>;

  projectId: number;
  packageId: string;

  projectService: ProjectService;

  cache: Record<any, any>;

  constructor(options: { projectId: number; packageId?: string }, connection: IDBConnection) {
    super(connection);

    this.data = {};

    this.projectId = options.projectId;

    this.packageId = options.packageId || uuidv4();

    this.projectService = new ProjectService(this.connection);

    this.cache = {};
  }

  async loadData() {
    const projectObject = await this.projectService.getProjectById(this.projectId);

    this.cache['project'] = projectObject;
  }

  async buildProjectEml() {
    await this.loadData();

    this.buildEMLSection();
    this.buildAccessSection();
    this.buildDatasetSection();

    return this.data as EmlFile;
  }

  buildEMLSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml',
      value: {
        $: {
          packageId: `urn:uuid:${this.packageId}`,
          system: EML_PROVIDER_URL,
          'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
          'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
        }
      }
    });
  }

  buildAccessSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml/access',
      value: {
        $: { authSystem: EML_SECURITY_PROVIDER_URL, order: 'allowFirst' },
        allow: { principal: 'public', permission: 'read' }
      }
    });
  }

  buildDatasetSection(options?: { datasetTitle?: string }) {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml/dataset',
      value: {
        $: { system: EML_PROVIDER_URL, id: this.packageId },
        title: options?.datasetTitle || this.packageId,
        pubDate: projectObject.project.publish_date,
        language: 'english',
        // creator: { organizationName: '' },
        metadataProvider: { organizationName: EML_ORGANIZATION_NAME, onlineUrl: EML_ORGANIZATION_URL },
        intellectualRights: { para: INTELLECTUAL_RIGHTS },
        contact: {
          ...this.getProjectContact()
        },
        project: {
          $: { id: '', system: EML_PROVIDER_URL },
          title: '',
          personnel: [
            {
              individualName: { givenName: '', surName: '' },
              organizationName: '',
              role: 'pointOfContact'
            }
          ],
          abstract: { section: { title: '', para: '' } },
          studyAreaDescription: {
            coverage: { geographicCoverage: '', temporalCoverage: '', taxonomicCoverage: '' }
          },
          relatedProject: {
            $: { id: '', system: EML_PROVIDER_URL },
            title: '',
            personnel: [
              {
                individualName: { givenName: '', surName: '' },
                organizationName: '',
                electronicMailAddress: '',
                role: 'pointOfContact'
              }
            ],
            abstract: { section: { title: 'Objectives', para: '' } },
            funding: {},
            studyAreaDescription: {
              coverage: { geographicCoverage: '', temporalCoverage: '', taxonomicCoverage: '' }
            }
          }
        }
      }
    });
  }

  getProjectContact(): Record<any, any> {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    if (!projectObject.contact.contacts.length) {
      return { organizationName: 'Not Supplied' };
    }

    const publicPrimaryContact = projectObject.contact.contacts.find((item) => item.is_primary && item.is_public);
    if (publicPrimaryContact) {
      return {
        individualName: { givenName: publicPrimaryContact.first_name, surName: publicPrimaryContact.last_name },
        organizationName: publicPrimaryContact.agency,
        electronicMailAddress: publicPrimaryContact.email_address
      };
    }

    const privatePrimaryContact = projectObject.contact.contacts.find((item) => item.is_primary);
    if (privatePrimaryContact) {
      return { organizationName: privatePrimaryContact.agency };
    }

    const publicContact = projectObject.contact.contacts.find((item) => item.is_public);
    if (publicContact) {
      return {
        individualName: { givenName: publicContact.first_name, surName: publicContact.last_name },
        organizationName: publicContact.agency,
        electronicMailAddress: publicContact.email_address
      };
    }

    const privateContact = projectObject.contact.contacts[0];
    return { organizationName: privateContact.agency };
  }

  //   buildAdditionalMetadataSection() {}
}
