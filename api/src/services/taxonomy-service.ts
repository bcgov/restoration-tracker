import axios from 'axios';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/taxonomy-service');

export class TaxonomySearchService {
  ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
  TAXONOMY_SEARCH = '/taxonomy/_search';
  /**
   * Fetch a search results from the platform service given the provided search request.
   *
   * @param {} searchRequest
   * @return {*}  {(Promise<any>)}
   * @memberof UserService
   */
  async getTaxonomySearchResults(searchRequest: any): Promise<any> {
    const searchResponse: any[] = [];

    defaultLog.debug({
      label: 'getTaxonomySearchResults',
      message: 'TaxonomySearchService class member values',
      ELASTICSEARCH_URL: this.ELASTICSEARCH_URL
    });
    defaultLog.debug({
      label: 'getTaxonomySearchResults',
      message: 'TaxonomySearchService class member values',
      TAXONOMY_SEARCH: this.TAXONOMY_SEARCH
    });

    const response = await axios({
      method: 'get',
      baseURL: this.ELASTICSEARCH_URL,
      url: this.TAXONOMY_SEARCH,
      data: searchRequest
    });

    defaultLog.debug({ label: 'getSearchResults', message: 'response.data', response_data: response.data });
    response.data.hits.hits.forEach((item: any) => {
      const label = `${item._source.code}: ${item._source.tty_kingdom} ${item._source.tty_name},${
        item._source.unit_name1 ? ` ${item._source.unit_name1}` : ''
      }${item._source.unit_name2 ? ` ${item._source.unit_name2}` : ''}${
        item._source.unit_name3 ? ` ${item._source.unit_name3}` : ''
      }${item._source.english_name ? `, ${item._source.english_name}` : ''}`;
      searchResponse.push({ id: item._id, label: label });
    });

    return searchResponse;
  }
}
