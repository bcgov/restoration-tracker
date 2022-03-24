import bbox from '@turf/bbox';
import circle from '@turf/circle';
import { AllGeoJSON, featureCollection } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import jsonpatch from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';
import { IDBConnection } from '../database/db';
import { ProjectObject, ProjectService } from './project-service';
import { DBService } from './service';
import { TaxonomySearchService } from './taxonomy-service';

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

// https://gist.github.com/amoeba/0a435e236a64a867bb10dd158010ac80
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
    await this.buildDatasetSection();

    await this.getFocalTaxonomicCoverage();

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

  async buildDatasetSection(options?: { datasetTitle?: string }) {
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
        metadataProvider: { organizationName: EML_ORGANIZATION_NAME, onlineUrl: EML_ORGANIZATION_URL },
        intellectualRights: { para: INTELLECTUAL_RIGHTS },
        contact: this.getProjectContact(),
        project: {
          $: { id: projectObject.project.uuid, system: EML_PROVIDER_URL },
          title: projectObject.project.project_name,
          personnel: this.getProjectPersonnel(),
          abstract: { section: { title: 'Objectives', para: projectObject.project.objectives } },
          studyAreaDescription: {
            coverage: {
              geographicCoverage: await this.getGeographicCoverageEML(),
              temporalCoverage: this.getTemporalCoverageEML(),
              taxonomicCoverage: ''
            }
          },
          funding: this.getProjectFundingSources()
        }
      }
    });
  }

  getProjectPersonnel(): Record<any, any>[] {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    if (!projectObject.contact.contacts.length) {
      return [];
    }

    return projectObject.contact.contacts.map((item) => {
      if (JSON.parse(item.is_public)) {
        return {
          individualName: { givenName: item.first_name, surName: item.last_name },
          organizationName: item.agency,
          electronicMailAddress: item.email_address,
          role: 'pointOfContact'
        };
      }

      return { organizationName: item.agency, role: 'pointOfContact' };
    });
  }

  getProjectContact(): Record<any, any> {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    if (!projectObject.contact.contacts.length) {
      return { organizationName: 'Not Supplied', onlineUrl: EML_ORGANIZATION_URL };
    }

    const publicPrimaryContact = projectObject.contact.contacts.find(
      (item) => JSON.parse(item.is_primary) && JSON.parse(item.is_public)
    );
    if (publicPrimaryContact) {
      return {
        individualName: { givenName: publicPrimaryContact.first_name, surName: publicPrimaryContact.last_name },
        organizationName: publicPrimaryContact.agency,
        electronicMailAddress: publicPrimaryContact.email_address
      };
    }

    const privatePrimaryContact = projectObject.contact.contacts.find((item) => JSON.parse(item.is_primary));
    if (privatePrimaryContact) {
      return { organizationName: privatePrimaryContact.agency };
    }

    const publicContact = projectObject.contact.contacts.find((item) => JSON.parse(item.is_public));
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

  getProjectFundingSources(): Record<any, any>[] {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    return projectObject.funding.fundingSources.map((item) => {
      return {
        section: {
          title: item.agency_name,
          section: [
            { title: 'Funding Agency Project ID', para: item.agency_project_id },
            { title: 'Investment Action/Category', para: item.investment_action_category_name },
            { title: 'Funding Amount', para: item.funding_amount },
            { title: 'Funding Start Date', para: new Date(item.start_date).toISOString().split('T')[0] },
            { title: 'Funding End Date', para: new Date(item.end_date).toISOString().split('T')[0] }
          ]
        }
      };
    });
  }

  getTemporalCoverageEML(): Record<any, any> {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    return {
      rangeOfDates: {
        beginDate: { calendarDate: projectObject.project.start_date },
        endDate: { calendarDate: projectObject.project.end_date }
      }
    };
  }

  async getGeographicCoverageEML(): Promise<Record<any, any>> {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    if (!projectObject.location.geometry) {
      return {};
    }

    const polygonFeatures = projectObject.location.geometry?.map((item) => {
      if (item.geometry.type === 'Point' && item.properties?.radius) {
        return circle(item.geometry, item.properties.radius, { units: 'meters' });
      }

      return item;
    });

    const projectBoundingBox = bbox(featureCollection(polygonFeatures));

    const geographicCoverage = {
      geographicDescription: projectObject.location.region,
      boundingCoordinates: {
        westBoundingCoordinate: projectBoundingBox[0],
        southBoundingCoordinate: projectBoundingBox[1],
        eastBoundingCoordinate: projectBoundingBox[2],
        northBoundingCoordinate: projectBoundingBox[3]
      }
    };

    const datasetGPolygon: Record<any, any>[] = [];

    polygonFeatures.forEach((feature, i: number) => {
      datasetGPolygon[i] = { datasetGPolygonOuterGRing: [] };

      const featureCoords: number[][] = [];

      coordEach(feature as AllGeoJSON, (currentCoord) => {
        featureCoords.push(currentCoord);
      });

      datasetGPolygon[i] = {
        datasetGPolygonOuterGRing: featureCoords.map((coords) => {
          return { gRingPoint: { gRingLongitude: coords[0], gRingLatitude: coords[1] } };
        })
      };
    });

    return { ...geographicCoverage, datasetGPolygon: datasetGPolygon };
  }

  async getFocalTaxonomicCoverage(): Promise<Record<any, any>> {
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    const taxonomySearchService = new TaxonomySearchService();

    const response = await taxonomySearchService.queryTaxonomyService({
      query: {
        terms: {
          _id: projectObject.species.focal_species
        }
      }
    });

    console.log(response);

    return response;

    // emlRoot.dataset.project.studyAreaDescription.coverage.taxonomicCoverage = { taxonomicClassification: [] };
    // focalTaxonomicCoverage.rows.forEach(function (row: any, i: number) {
    //   emlRoot.dataset.project.studyAreaDescription.coverage.taxonomicCoverage.taxonomicClassification[i] = {
    //     taxonRankName: row.tty_name,
    //     taxonRankValue: row.unit_name1 + ' ' + row.unit_name2,
    //     commonName: row.english_name,
    //     taxonId: { $: { provider: taxonomicProviderURL }, _: row.code }
    //   };
    // });

    // return connection.query(sqlStatement.text, sqlStatement.values);
  }
}
