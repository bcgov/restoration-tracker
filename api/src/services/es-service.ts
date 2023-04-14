import { Client } from '@elastic/elasticsearch';
import { AggregationsAggregate, SearchHit, SearchRequest, SearchResponse } from '@elastic/elasticsearch/lib/api/types';

export const ElasticSearchIndices = {
  TAXONOMY: process.env.ELASTICSEARCH_TAXONOMY_INDEX || 'taxonomy_3.0.0'
};

/**
 * Base class for services that require a elastic search connection.
 *
 * @export
 * @class ESService
 */
export class ESService {
  esClient: Client | undefined = undefined;

  /**
   * Returns the Elasticsearch Client instance. If `this.esClient` isn't defined,
   * a new Elasticsearch Client is instantiated.
   *
   * @return {*}  {Promise<Client>}
   * @memberof ESService
   */
  async getEsClient(): Promise<Client> {
    if (!this.esClient) {
      this.esClient = await new Client({ node: process.env.ELASTICSEARCH_URL });
    }
    return this.esClient;
  }

  /**
   * Performs a search in Elasticsearch.
   * @param searchRequest The ES search request
   * @returns {Promise<SearchHit<T>>} The results of the search
   */
  async _elasticSearch<T = unknown>(searchRequest: SearchRequest): Promise<SearchHit<T>[]> {
    const { index, ...request } = searchRequest;
    const esClient = await this.getEsClient();

    const response: SearchResponse<T, Record<string, AggregationsAggregate>> = await esClient.search<T>({
      index: String(index).toLowerCase(),
      ...request
    });

    return response.hits.hits;
  }
}
