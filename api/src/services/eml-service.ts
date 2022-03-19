import jsonpatch from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';

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

export class XMLBuilder<Attributes extends object, Children extends object> {
  data: Record<string, never>;

  basePath: string;

  constructor(basePath: string) {
    this.data = {};

    this.basePath = basePath;
  }

  get Data(): (XmlAttributes<Attributes> & Children) | Record<string, never> {
    return this.data;
  }

  get BasePath(): string {
    return this.basePath;
  }

  setData(attributes: Attributes, children: Children): this {
    this.setAttributes(attributes);
    this.setChildren(children);
    return this;
  }

  setAttributes(attributes: Attributes): this {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: this.basePath,
      value: {
        $: {
          ...attributes
        }
      }
    });

    return this;
  }

  appendAttributes(attributes: Attributes): this {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: this.basePath,
      value: {
        $: {
          ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/$`),
          ...attributes
        }
      }
    });

    return this;
  }

  setChildren(children: Children): this {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: this.basePath,
      value: {
        $: {
          ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/$`)
        },
        ...children
      }
    });

    return this;
  }

  appendChildren(children: Children): this {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: this.basePath,
      value: {
        ...jsonpatch.getValueByPointer(this.data, this.basePath),
        ...children
      }
    });

    return this;
  }

  addBuilder(builder: XMLBuilder<any, any> | XMLArrayBuilder<any, any>): this {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: this.basePath + builder.basePath,
      value: {
        ...builder.Data
      }
    });

    return this;
  }
}

export class XMLArrayBuilder<Attributes extends Record<string, unknown>, Children extends Record<string, unknown>> {
  data: Record<string, never>;

  basePath: string;

  constructor(basePath: string) {
    this.data = {};

    this.basePath = basePath;

    jsonpatch.applyOperation(this.data, {
      op: 'replace',
      path: this.basePath,
      value: []
    });
  }

  get Data(): (XmlAttributes<Attributes> & Children) | Record<string, never> {
    return this.data;
  }

  get BasePath(): string {
    return this.basePath;
  }

  setData(data: { attributes: Attributes; children: Children }[]): this {
    jsonpatch.applyOperation(this.data, {
      op: 'replace',
      path: this.basePath,
      value: data.map((item) => {
        return {
          ...item.children,
          $: {
            ...item.attributes
          }
        };
      })
    });

    return this;
  }

  setAttributes(index: number, attributes: Attributes): this {
    jsonpatch.applyOperation(this.data, {
      op: 'replace',
      path: `${this.basePath}/${index}`,
      value: {
        ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/${index}`),
        $: {
          ...attributes
        }
      }
    });

    return this;
  }

  appendAttributes(index: number, attributes: Attributes): this {
    if (!jsonpatch.getValueByPointer(this.data, `${this.basePath}/${index}`)) {
      return this.setAttributes(index, attributes);
    }

    jsonpatch.applyOperation(this.data, {
      op: 'replace',
      path: `${this.basePath}/${index}/$`,
      value: {
        ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/${index}/$`),
        ...attributes
      }
    });

    return this;
  }

  setChildren(index: number, children: Children): this {
    jsonpatch.applyOperation(this.data, {
      op: 'replace',
      path: `${this.basePath}/${index}`,
      value: {
        $: {
          ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/${index}/$`)
        },
        ...children
      }
    });

    return this;
  }

  appendChildren(index: number, children: Children): this {
    jsonpatch.applyOperation(this.data, {
      op: 'replace',
      path: `${this.basePath}/${index}`,
      value: {
        ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/${index}`),
        ...children,
        $: {
          ...jsonpatch.getValueByPointer(this.data, `${this.basePath}/${index}/$`)
        }
      }
    });

    return this;
  }
}

export class EmlBuilder extends XMLBuilder<EmlSectionAttributes, EmlSectionChildren> {
  emlFile: object;

  packageId: string;

  constructor(packageId?: string) {
    super('eml');

    this.emlFile = {};

    this.packageId = packageId || uuidv4();
  }

  get PackageId(): string {
    return this.packageId;
  }

  get EmlFile(): EmlFile {
    return this.emlFile as EmlFile;
  }
}
