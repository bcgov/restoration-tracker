// import axios from 'axios';
import { getLogger } from '../utils/logger';
import { Client } from '@elastic/elasticsearch';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';

const defaultLog = getLogger('services/taxonomy-service');

export class TaxonomyService {
  private client: Client;

  constructor() {
    this.client = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  private async elasticSearch(searchRequest: SearchRequest) {
    defaultLog.debug({ label: 'elasticSearch', message: 'params', searchRequest: searchRequest });

    try {
      const response = await this.client.search({
        index: 'taxonomy',
        ...searchRequest
      });

      defaultLog.debug({ label: 'elasticSearch', message: 'response', response_data: response });
      return response;
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }
  }

  private sanitizeSpeciesData = (data: any) => {
    return data.map((item: any) => {
      const label = `${item._source.code}: ${item._source.tty_kingdom} ${item._source.tty_name},${
        item._source.unit_name1 ? ` ${item._source.unit_name1}` : ''
      }${item._source.unit_name2 ? ` ${item._source.unit_name2}` : ''}${
        item._source.unit_name3 ? ` ${item._source.unit_name3}` : ''
      }${item._source.english_name ? `, ${item._source.english_name}` : ''}`;

      return { id: item._id, label: label };
    });
  };

  async getSpeciesFromIds(ids: string[]) {
    const response = await this.elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return response ? this.sanitizeSpeciesData(response.hits.hits) : [];
  }

  async searchSpecies(term: string) {
    const response = await this.elasticSearch({
      query: {
        multi_match: {
          query: term,
          fields: ['unit_name1', 'unit_name2', 'unit_name3', 'code', 'tty_kingdom', 'tty_name', 'english_name']
        }
      }
    });

    return response ? this.sanitizeSpeciesData(response.hits.hits) : [];
  }
}
