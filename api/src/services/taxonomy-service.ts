import { getLogger } from '../utils/logger';
import { Client } from '@elastic/elasticsearch';
import { SearchRequest, SearchHit } from '@elastic/elasticsearch/lib/api/types';

const defaultLog = getLogger('services/taxonomy-service');

export class TaxonomyService {
  private async elasticSearch(searchRequest: SearchRequest) {
    try {
      const client = new Client({ node: process.env.ELASTICSEARCH_URL });
      return await client.search({
        index: 'taxonomy',
        ...searchRequest
      });
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }
  }

  private sanitizeSpeciesData = (data: SearchHit<any>[]) => {
    return data.map((item) => {
      const unit_name1 = item._source.unit_name1 || '';
      const unit_name2 = item._source.unit_name2 || '';
      const unit_name3 = item._source.unit_name3 || '';
      const english_name = item._source.english_name || '';
      const label = `${item._source.code}: ${item._source.tty_kingdom} ${item._source.tty_name}, ${unit_name1} ${unit_name2} ${unit_name3}, ${english_name}`;

      return { id: item._id, label: label };
    });
  };

  async getTaxonomyFromIds(ids: number[]) {
    const response = await this.elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return (response && response.hits.hits.map((item) => item._source)) || [];
  }

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
