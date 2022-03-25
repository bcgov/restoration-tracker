import bbox from '@turf/bbox';
import circle from '@turf/circle';
import { AllGeoJSON, featureCollection } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import jsonpatch from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';
import { IDBConnection } from '../database/db';
import { getDbCharacterSystemMetaDataConstantSQL } from '../queries/codes/db-constant-queries';
import { queries } from '../queries/queries';
import { getNRMRegions } from '../utils/spatial-utils';
import { ProjectObject, ProjectService } from './project-service';
import { DBService } from './service';
import { TaxonomyService } from './taxonomy-service';

const NOT_SUPPLIED_CONSTANT = 'Not Supplied';

const DEFAULT_DB_CONSTANTS = {
  EML_VERSION: '1.0.0',
  EML_PROVIDER_URL: NOT_SUPPLIED_CONSTANT,
  EML_SECURITY_PROVIDER_URL: NOT_SUPPLIED_CONSTANT,
  EML_ORGANIZATION_NAME: NOT_SUPPLIED_CONSTANT,
  EML_ORGANIZATION_URL: NOT_SUPPLIED_CONSTANT,
  EML_TAXONOMIC_PROVIDER_URL: NOT_SUPPLIED_CONSTANT,
  EML_INTELLECTUAL_RIGHTS: NOT_SUPPLIED_CONSTANT
};

type EMLDBConstants = {
  EML_VERSION: string;
  EML_PROVIDER_URL: string;
  EML_SECURITY_PROVIDER_URL: string;
  EML_ORGANIZATION_NAME: string;
  EML_ORGANIZATION_URL: string;
  EML_TAXONOMIC_PROVIDER_URL: string;
  EML_INTELLECTUAL_RIGHTS: string;
};

/**
 * Service to produce EML data for a project.
 *
 * @see https://eml.ecoinformatics.org for EML specification
 * @export
 * @class EmlService
 * @extends {DBService}
 */
export class EmlService extends DBService {
  data: Record<string, unknown>;

  projectId: number;
  packageId: string;

  projectService: ProjectService;

  cache: Record<any, any>;

  constants: EMLDBConstants;

  constructor(options: { projectId: number; packageId?: string }, connection: IDBConnection) {
    super(connection);

    this.data = {};

    this.projectId = options.projectId;

    this.packageId = options.packageId || uuidv4();

    this.projectService = new ProjectService(this.connection);

    this.cache = {};

    this.constants = DEFAULT_DB_CONSTANTS;
  }

  get projectData(): ProjectObject {
    if (!this.cache['projectData']) {
      throw Error('Project data was not loaded');
    }

    return this.cache['projectData'];
  }

  async loadProjectData() {
    const projectData = await this.projectService.getProjectById(this.projectId);

    this.cache['projectData'] = projectData;
  }

  async loadEMLDBConstants() {
    const [organizationUrl, organizationName] = await Promise.all([
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_URL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_NAME_FULL'))
    ]);

    this.constants.EML_ORGANIZATION_URL = organizationUrl.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_ORGANIZATION_NAME = organizationName.rows[0].constant || NOT_SUPPLIED_CONSTANT;
  }

  async buildProjectEml() {
    await this.loadProjectData();
    await this.loadEMLDBConstants();

    this.buildEMLSection();
    this.buildAccessSection();
    await this.buildDatasetSection();
    await this.buildAdditionalMetadataSection();

    return this.data;
  }

  buildEMLSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml',
      value: {
        $: {
          packageId: `urn:uuid:${this.packageId}`,
          system: this.constants.EML_PROVIDER_URL,
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
        $: { authSystem: this.constants.EML_SECURITY_PROVIDER_URL, order: 'allowFirst' },
        allow: { principal: 'public', permission: 'read' }
      }
    });
  }

  async buildDatasetSection(options?: { datasetTitle?: string }) {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml/dataset',
      value: {
        $: { system: this.constants.EML_PROVIDER_URL, id: this.packageId },
        title: options?.datasetTitle || this.packageId,
        pubDate: this.projectData.project.publish_date,
        language: 'english',
        metadataProvider: {
          organizationName: this.constants.EML_ORGANIZATION_NAME,
          onlineUrl: this.constants.EML_ORGANIZATION_URL
        },
        intellectualRights: { para: this.constants.EML_INTELLECTUAL_RIGHTS },
        contact: this.getProjectContact(),
        project: {
          $: { id: this.projectData.project.uuid, system: this.constants.EML_PROVIDER_URL },
          title: this.projectData.project.project_name,
          personnel: this.getProjectPersonnel(),
          abstract: { section: { title: 'Objectives', para: this.projectData.project.objectives } },
          studyAreaDescription: {
            coverage: {
              geographicCoverage: await this.getGeographicCoverageEML(),
              temporalCoverage: this.getTemporalCoverageEML(),
              taxonomicCoverage: await this.getFocalTaxonomicCoverage()
            }
          },
          funding: this.getProjectFundingSources()
        }
      }
    });
  }

  async buildAdditionalMetadataSection() {
    const [firstNationsData] = await Promise.all([
      this.connection.sql<{ name: string }>(queries.eml.getProjectFirstNationsSQL(this.projectId))
    ]);

    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml/additionalMetadata',
      value: [
        {
          describes: this.packageId,
          metadata: {
            IUCNConservationActions: {
              IUCNConservationAction: this.projectData.iucn.classificationDetails.map((item) => {
                return {
                  IUCNConservationActionLevel1Classification: item.classification,
                  IUCNConservationActionLevel2SubClassification: item.subClassification1,
                  IUCNConservationActionLevel3SubClassification: item.subClassification2
                };
              })
            }
          }
        },
        {
          describes: this.packageId,
          metadata: {
            stakeholderPartnerships: {
              stakeholderPartnership: this.projectData.partnerships.stakeholder_partnerships.map((item) => {
                return { name: item };
              })
            }
          }
        },
        {
          describes: this.packageId,
          metadata: {
            firstNationPartnerships: {
              firstNationPartnership: firstNationsData.rows.map((item) => {
                return { name: item.name };
              })
            }
          }
        },
        {
          describes: this.packageId,
          metadata: {
            permits: {
              permit: this.projectData.permit.permits.map((item) => {
                return { permitType: item.permit_type, permitNumber: item.permit_number };
              })
            }
          }
        },
        {
          describes: this.packageId,
          metadata: {
            priorityArea: {
              isPriority: false // TODO assign priority when its merged: this.projectData.location.priority
            }
          }
        }
      ]
    });
  }

  getProjectPersonnel(): Record<any, any>[] {
    if (!this.projectData.contact.contacts.length) {
      return [];
    }

    return this.projectData.contact.contacts.map((item) => {
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
    if (!this.projectData.contact.contacts.length) {
      return { organizationName: this.constants.EML_ORGANIZATION_NAME, onlineUrl: this.constants.EML_ORGANIZATION_URL };
    }

    const publicPrimaryContact = this.projectData.contact.contacts.find(
      (item) => JSON.parse(item.is_primary) && JSON.parse(item.is_public)
    );
    if (publicPrimaryContact) {
      return {
        individualName: { givenName: publicPrimaryContact.first_name, surName: publicPrimaryContact.last_name },
        organizationName: publicPrimaryContact.agency,
        electronicMailAddress: publicPrimaryContact.email_address
      };
    }

    const privatePrimaryContact = this.projectData.contact.contacts.find((item) => JSON.parse(item.is_primary));
    if (privatePrimaryContact) {
      return { organizationName: privatePrimaryContact.agency };
    }

    const publicContact = this.projectData.contact.contacts.find((item) => JSON.parse(item.is_public));
    if (publicContact) {
      return {
        individualName: { givenName: publicContact.first_name, surName: publicContact.last_name },
        organizationName: publicContact.agency,
        electronicMailAddress: publicContact.email_address
      };
    }

    const privateContact = this.projectData.contact.contacts[0];
    return { organizationName: privateContact.agency };
  }

  getProjectFundingSources(): Record<any, any>[] {
    return this.projectData.funding.fundingSources.map((item) => {
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
    return {
      rangeOfDates: {
        beginDate: { calendarDate: this.projectData.project.start_date },
        endDate: { calendarDate: this.projectData.project.end_date }
      }
    };
  }

  async getGeographicCoverageEML(): Promise<Record<any, any>> {
    if (!this.projectData.location.geometry) {
      return {};
    }

    const polygonFeatures = this.projectData.location.geometry?.map((item) => {
      if (item.geometry.type === 'Point' && item.properties?.radius) {
        return circle(item.geometry, item.properties.radius, { units: 'meters' });
      }

      return item;
    });

    const projectBoundingBox = bbox(featureCollection(polygonFeatures));

    const regionName = (await getNRMRegions()).find((item) => item.id === this.projectData.location.region);

    const geographicCoverage = {
      geographicDescription: regionName,
      boundingCoordinates: {
        westBoundingCoordinate: projectBoundingBox[0],
        southBoundingCoordinate: projectBoundingBox[1],
        eastBoundingCoordinate: projectBoundingBox[2],
        northBoundingCoordinate: projectBoundingBox[3]
      }
    };

    const datasetGPolygons: Record<any, any>[] = [];

    polygonFeatures.forEach((feature) => {
      const featureCoords: number[][] = [];

      coordEach(feature as AllGeoJSON, (currentCoord) => {
        featureCoords.push(currentCoord);
      });

      datasetGPolygons.push({
        datasetGPolygonOuterGRing: featureCoords.map((coords) => {
          return { gRingPoint: { gRingLongitude: coords[0], gRingLatitude: coords[1] } };
        })
      });
    });

    return { ...geographicCoverage, datasetGPolygon: datasetGPolygons };
  }

  async getFocalTaxonomicCoverage(): Promise<Record<any, any>> {
    const taxonomySearchService = new TaxonomyService();

    const response = await taxonomySearchService.getTaxonomyFromIds(this.projectData.species.focal_species);

    const taxonomicClassifications: Record<string, any>[] = [];

    response.forEach((item) => {
      const taxonRecord = item as Record<string, any>;

      taxonomicClassifications.push({
        taxonRankName: taxonRecord.tty_name,
        taxonRankValue: `${taxonRecord.unit_name1} ${taxonRecord.unit_name2} ${taxonRecord.unit_name3}`,
        commonName: taxonRecord.english_name,
        taxonId: { $: { provider: this.constants.EML_TAXONOMIC_PROVIDER_URL }, _: taxonRecord.code }
      });
    });

    return { taxonomicClassification: taxonomicClassifications };
  }
}
