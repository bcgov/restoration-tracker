import { expect } from 'chai';
import { describe } from 'mocha';
import {
  AccessSectionAttributes,
  AccessSectionChildren,
  DatasetSectionAttributes,
  DatasetSectionChildren,
  EmlBuilder,
  EML_PROVIDER_URL,
  EML_SECURITY_PROVIDER_URL,
  XMLArrayBuilder,
  XMLBuilder
} from './eml-service';

describe.only('Eml', () => {
  describe('EmlBuilder', () => {
    it('temp', () => {
      const emlBuilder = new EmlBuilder();

      emlBuilder.setAttributes({ packageId: `urn:uuid:${emlBuilder.packageId}`, system: EML_PROVIDER_URL });

      const accessBuilder = new XMLBuilder<AccessSectionAttributes, AccessSectionChildren>('/access');
      accessBuilder.setData(
        { authSystem: EML_SECURITY_PROVIDER_URL, order: 'allowFirst' },
        { allow: { principal: 'public', permission: 'read' } }
      );

      emlBuilder.addBuilder(accessBuilder);

      const datasetBuilder = new XMLBuilder<DatasetSectionAttributes, DatasetSectionChildren>('/dataset');

      datasetBuilder.setAttributes({ system: EML_PROVIDER_URL, id: emlBuilder.PackageId });
      datasetBuilder.appendChildren({ title: 'testTitle' });
      datasetBuilder.appendChildren({ pubDate: '' });
      datasetBuilder.appendChildren({ language: '' });
      datasetBuilder.appendChildren({ creator: { organizationName: '' } });
      datasetBuilder.appendChildren({ metadataProvider: { organizationName: '', onlineUrl: '' } });
      datasetBuilder.appendChildren({ intellectualRights: { para: '' } });
      datasetBuilder.appendChildren({ contact: { para: '' } });

      const projectBuilder = new XMLBuilder<any, any>('/project');
      projectBuilder.setAttributes({ id: '', system: EML_PROVIDER_URL });
      projectBuilder.appendChildren({ title: '' });

      const personnelBuilder = new XMLArrayBuilder('/personnel');
      personnelBuilder.setData([
        {
          attributes: {},
          children: {
            individualName: { givenName: '', surName: '' },
            organizationName: '',
            role: 'pointOfContact'
          }
        }
      ]);

      projectBuilder.addBuilder(personnelBuilder);

      // emlBuilder.appendChildren({ abstract: { section: { title: '', para: '' } } });
      // emlBuilder.appendChildren({
      //   studyAreaDescription: {
      //     coverage: { geographicCoverage: '', temporalCoverage: '', taxonomicCoverage: '' }
      //   }
      // });

      // emlBuilder.addDatasetElement('/project/relatedProject', { $: { id: '', system: EML_PROVIDER_URL }, title: '' });
      // emlBuilder.addDatasetElement('/project/relatedProject/personnel', {
      //   individualName: { givenName: '', surName: '' },
      //   organizationName: '',
      //   electronicMailAddress: '',
      //   role: 'pointOfContact'
      // });
      // emlBuilder.addDatasetElement('/project/relatedProject/abstract', {
      //   section: [{ title: 'Objectives', para: '' }]
      // });
      // emlBuilder.addDatasetElement('/project/relatedProject/funding', {});
      // emlBuilder.addDatasetElement('/project/relatedProject/studyAreaDescription', {
      //   coverage: { geographicCoverage: '', temporalCoverage: '', taxonomicCoverage: '' }
      // });
      // emlBuilder.addDatasetElement('/project/relatedProject/studyAreaDescription', {
      //   coverage: { geographicCoverage: '', temporalCoverage: '', taxonomicCoverage: '' }
      // });

      datasetBuilder.addBuilder(projectBuilder);

      emlBuilder.addBuilder(datasetBuilder);

      // emlBuilder.setAdditionalMetadata(0, {});
      // emlBuilder.addAdditionalMetadataElement(0, '', {
      //   describes: emlBuilder.PackageId,
      //   metadata: { restorationTrackerEML: { type: 'project', version: EML_VERSION } }
      // });

      // emlBuilder.setAdditionalMetadata(1, {});
      // emlBuilder.addAdditionalMetadataElement(1, '', {
      //   describes: emlBuilder.PackageId,
      //   metadata: { IUCNConservationActions: { IUCNConservationAction: [] } }
      // });

      // emlBuilder.setAdditionalMetadata(2, {});
      // emlBuilder.addAdditionalMetadataElement(2, '', {
      //   describes: emlBuilder.PackageId,
      //   metadata: { stakeholderPartnerships: { stakeholderPartnership: [] } }
      // });

      // emlBuilder.setAdditionalMetadata(3, {});
      // emlBuilder.addAdditionalMetadataElement(3, '', {
      //   describes: emlBuilder.PackageId,
      //   metadata: { stakeholderPartnerships: { stakeholderPartnership: [] } }
      // });

      // emlBuilder.setAdditionalMetadata(4, {});
      // emlBuilder.addAdditionalMetadataElement(4, '', {
      //   describes: emlBuilder.PackageId,
      //   metadata: { firstNations: { firstNation: [] } }
      // });

      console.log(emlBuilder.Data);

      expect(emlBuilder).not.to.be.null;
    });
  });

  describe('XMLBuilder', () => {
    describe('setData', () => {
      it('updates data as expected', () => {
        const builder = new XMLBuilder<any, any>('/root');

        builder.setData({ id: 1 }, { level1: { value1: 2, value2: 3 } });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 },
            level1: {
              value1: 2,
              value2: 3
            }
          }
        });
      });
    });

    describe('setAttributes', () => {
      it('updates data as expected', () => {
        const builder = new XMLBuilder<any, any>('/root');

        builder.setAttributes({ id: 1 });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 }
          }
        });

        builder.setAttributes({ id3: 3 });

        expect(builder.Data).to.eql({
          root: {
            $: { id3: 3 }
          }
        });
      });
    });

    describe('appendAttributes', () => {
      it('updates data as expected', () => {
        const builder = new XMLBuilder<any, any>('/root');

        builder.setAttributes({ id: 1 });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 }
          }
        });

        builder.appendAttributes({ name: 'attr' });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1, name: 'attr' }
          }
        });
      });
    });

    describe('setChildren', () => {
      it('updates data as expected', () => {
        const builder = new XMLBuilder<any, any>('/root');

        builder.setAttributes({ id: 1 });
        builder.setChildren({ name: 'child' });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 },
            name: 'child'
          }
        });

        builder.setChildren({ name2: 'child2' });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 },
            name2: 'child2'
          }
        });
      });
    });

    describe('appendChildren', () => {
      it('updates data as expected', () => {
        const builder = new XMLBuilder<any, any>('/root');

        builder.setAttributes({ id: 1 });
        builder.appendChildren({ name: 'child' });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 },
            name: 'child'
          }
        });

        builder.appendChildren({ name2: 'child2' });

        expect(builder.Data).to.eql({
          root: {
            $: { id: 1 },
            name: 'child',
            name2: 'child2'
          }
        });
      });
    });
  });

  describe('XMLArrayBuilder', () => {
    describe('setData', () => {
      it('updates data as expected', () => {
        const builder = new XMLArrayBuilder<any, any>('/root');

        builder.setData([
          {
            attributes: { id: 1 },
            children: { level1: { value1: 2, value2: 3 } }
          },
          {
            attributes: { id: 2 },
            children: { level1A: { value1: 4, value2: 5 }, level1B: 6 }
          }
        ]);

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 },
              level1: {
                value1: 2,
                value2: 3
              }
            },
            {
              $: { id: 2 },
              level1A: {
                value1: 4,
                value2: 5
              },
              level1B: 6
            }
          ]
        });
      });
    });

    describe('setAttributes', () => {
      it('updates data as expected', () => {
        const builder = new XMLArrayBuilder<any, any>('/root');

        builder.setAttributes(0, { id: 1 });
        builder.setAttributes(1, { id: 2 });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 }
            },
            {
              $: { id: 2 }
            }
          ]
        });

        builder.setAttributes(1, { id3: 3 });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 }
            },
            {
              $: { id3: 3 }
            }
          ]
        });
      });
    });

    describe('appendAttributes', () => {
      it('updates data as expected', () => {
        const builder = new XMLArrayBuilder<any, any>('/root');

        builder.setAttributes(0, { id: 1 });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 }
            }
          ]
        });

        builder.appendAttributes(0, { name: 'attr' });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1, name: 'attr' }
            }
          ]
        });
      });
    });

    describe('setChildren', () => {
      it('updates data as expected', () => {
        const builder = new XMLArrayBuilder<any, any>('/root');

        builder.setAttributes(0, { id: 1 });
        builder.setChildren(0, { name: 'child' });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 },
              name: 'child'
            }
          ]
        });

        builder.setChildren(0, { name2: 'child2' });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 },
              name2: 'child2'
            }
          ]
        });
      });
    });

    describe('appendChildren', () => {
      it('updates data as expected', () => {
        const builder = new XMLArrayBuilder<any, any>('/root');

        builder.setAttributes(0, { id: 1 });
        builder.appendChildren(0, { name: 'child' });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 },
              name: 'child'
            }
          ]
        });

        builder.appendChildren(0, { name2: 'child2' });

        expect(builder.Data).to.eql({
          root: [
            {
              $: { id: 1 },
              name: 'child',
              name2: 'child2'
            }
          ]
        });
      });
    });
  });
});
