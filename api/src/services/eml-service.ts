import jsonpatch from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';
import { IDBConnection } from '../database/db';
import { DBService } from './service';

export const EML_VERSION = '1.0.0';
export const EML_PROVIDER_URL = '';
export const EML_SECURITY_PROVIDER_URL = '';
export const EML_ORGANIZATION_NAME = '';
export const EML_ORGANIZATION_URL = '';
export const EML_TAXONOMIC_PROVIDER_URL = '';

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
  data;

  constructor(connection: IDBConnection) {
    super(connection);

    this.data = {};
  }

  buildProjectEml() {
    const emlFile = {};

    return emlFile;
  }

  setEMLSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml',
      value: {
        $: { packageId: `urn:uuid:${emlBuilder.packageId}`, system: EML_PROVIDER_URL }
      }
    });
  }
}
