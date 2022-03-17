import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { TaxonomySearchService } from '../../services/taxonomy-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/taxonomy/list');

export const GET: Operation = [getSearchResults()];

//TODO convert request body to parameters to accommodate app request
GET.apiDoc = {
  description: 'Gets the labels of the taxonomic units identified by the provided list of ids.',
  tags: ['taxonomy'],
  requestBody: {
    description: 'Taxonomy search body request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Taxonomy request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Taxonomy search response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get taxonomic search results.
 *
 * @returns {RequestHandler}
 */
 export function getSearchResults(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSearchResults', message: 'request body', req_body: req.body });
    try {
      const searchRequest = {
        query: {
          terms: {
            _id: req.body.ids
          }
        }
      };

      const taxonomySearch = new TaxonomySearchService();
      const response = await taxonomySearch.getTaxonomySearchResults(searchRequest);

      res.status(200).send({ searchResponse: response });
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    }
  };
}
