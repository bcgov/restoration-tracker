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

const DEFAULT_DB_CONSTANTS = {
  EML_VERSION: '1.0.0',
  EML_PROVIDER_URL: '',
  EML_SECURITY_PROVIDER_URL: '',
  EML_ORGANIZATION_NAME: '',
  EML_ORGANIZATION_URL: '',
  EML_TAXONOMIC_PROVIDER_URL: '',
  EML_INTELLECTUAL_RIGHTS: ''
};

const NOT_SUPPLIED_CONSTANT = 'Not Supplied';

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

  constants: {
    EML_VERSION: string;
    EML_PROVIDER_URL: string;
    EML_SECURITY_PROVIDER_URL: string;
    EML_ORGANIZATION_NAME: string;
    EML_ORGANIZATION_URL: string;
    EML_TAXONOMIC_PROVIDER_URL: string;
    EML_INTELLECTUAL_RIGHTS: string;
  };

  constructor(options: { projectId: number; packageId?: string }, connection: IDBConnection) {
    super(connection);

    this.data = {};

    this.projectId = options.projectId;

    this.packageId = options.packageId || uuidv4();

    this.projectService = new ProjectService(this.connection);

    this.cache = {};

    this.constants = DEFAULT_DB_CONSTANTS;
  }

  async loadData() {
    const projectObject = await this.projectService.getProjectById(this.projectId);

    this.cache['project'] = projectObject;
  }

  async loadDBConstants() {
    const [organizationUrl, organizationName] = await Promise.all([
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_URL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_NAME_FULL'))
    ]);

    this.constants.EML_ORGANIZATION_URL = organizationUrl.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_ORGANIZATION_NAME = organizationName.rows[0].constant || NOT_SUPPLIED_CONSTANT;
  }

  async buildProjectEml() {
    await this.loadData();

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
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml/dataset',
      value: {
        $: { system: this.constants.EML_PROVIDER_URL, id: this.packageId },
        title: options?.datasetTitle || this.packageId,
        pubDate: projectObject.project.publish_date,
        language: 'english',
        metadataProvider: {
          organizationName: this.constants.EML_ORGANIZATION_NAME,
          onlineUrl: this.constants.EML_ORGANIZATION_URL
        },
        intellectualRights: { para: this.constants.EML_INTELLECTUAL_RIGHTS },
        contact: this.getProjectContact(),
        project: {
          $: { id: projectObject.project.uuid, system: this.constants.EML_PROVIDER_URL },
          title: projectObject.project.project_name,
          personnel: this.getProjectPersonnel(),
          abstract: { section: { title: 'Objectives', para: projectObject.project.objectives } },
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
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

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
              IUCNConservationAction: projectObject.iucn.classificationDetails.map((item) => {
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
              stakeholderPartnership: projectObject.partnerships.stakeholder_partnerships.map((item) => {
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
              permit: projectObject.permit.permits.map((item) => {
                return { permitType: item.permit_type, permitNumber: item.permit_number };
              })
            }
          }
        },
        {
          describes: this.packageId,
          metadata: {
            priorityArea: {
              isPriority: false // TODO assign priority when its merged: projectObject.location.priority
            }
          }
        }
      ]
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
      return { organizationName: this.constants.EML_ORGANIZATION_NAME, onlineUrl: this.constants.EML_ORGANIZATION_URL };
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

    const regionName = (await getNRMRegions()).find((item) => item.id === projectObject.location.region);

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
    const projectObject: ProjectObject = this.cache['project'];

    if (!projectObject) {
      throw Error('Project data not found');
    }

    const taxonomySearchService = new TaxonomyService();

    const response = await taxonomySearchService.getTaxonomyFromIds(projectObject.species.focal_species);

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
