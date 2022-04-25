import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { coordinator_agency } from '../constants/codes';
import * as spatialUtils from '../utils/spatial-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeService } from './code-service';

chai.use(sinonChai);

describe('CodeService', () => {
  describe('getAllCodeSets', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns all code sets', async function () {
      const mockQuery = sinon.stub();
      mockQuery.resolves({
        rows: [{ id: 1, name: 'codeName' }]
      });

      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      sinon.stub(spatialUtils, 'getNRMRegions').resolves([{ id: 1, name: 'codeName' }]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'first_nations',
        'funding_source',
        'investment_action_category',
        'coordinator_agency',
        'iucn_conservation_action_level_1_classification',
        'iucn_conservation_action_level_2_subclassification',
        'iucn_conservation_action_level_3_subclassification',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'ranges',
        'regions'
      );

      const queryReturn = [{ id: 1, name: 'codeName' }];

      expect(response.first_nations).to.eql(queryReturn);
      expect(response.funding_source).to.eql(queryReturn);
      expect(response.investment_action_category).to.eql(queryReturn);
      //cordinator agency currently hardcoded
      expect(response.coordinator_agency).to.eql(coordinator_agency);
      expect(response.iucn_conservation_action_level_1_classification).to.eql(queryReturn);
      expect(response.iucn_conservation_action_level_2_subclassification).to.eql(queryReturn);
      expect(response.iucn_conservation_action_level_3_subclassification).to.eql(queryReturn);
      expect(response.system_roles).to.eql(queryReturn);
      expect(response.project_roles).to.eql(queryReturn);
      expect(response.administrative_activity_status_type).to.eql(queryReturn);
      expect(response.ranges).to.eql(queryReturn);
      //expect(response.regions).to.eql(queryReturn);
    });

    it('returns all empty code sets', async function () {
      const mockQuery = sinon.stub();
      mockQuery.resolves({});

      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      sinon.stub(spatialUtils, 'getNRMRegions').resolves([{ id: 1, name: 'codeName' }]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'first_nations',
        'funding_source',
        'investment_action_category',
        'coordinator_agency',
        'iucn_conservation_action_level_1_classification',
        'iucn_conservation_action_level_2_subclassification',
        'iucn_conservation_action_level_3_subclassification',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'ranges',
        'regions'
      );
      expect(response.first_nations).to.eql([]);
      expect(response.funding_source).to.eql([]);
      expect(response.investment_action_category).to.eql([]);
      //cordinator agency currently hardcoded
      expect(response.coordinator_agency).to.eql(coordinator_agency);
      expect(response.iucn_conservation_action_level_1_classification).to.eql([]);
      expect(response.iucn_conservation_action_level_2_subclassification).to.eql([]);
      expect(response.iucn_conservation_action_level_3_subclassification).to.eql([]);
      expect(response.system_roles).to.eql([]);
      expect(response.project_roles).to.eql([]);
      expect(response.administrative_activity_status_type).to.eql([]);
      expect(response.ranges).to.eql([]);
      //expect(response.regions).to.eql([]);
    });
  });
});
