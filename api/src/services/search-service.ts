import { Knex } from 'knex';
import { KnexDBConnection } from '../database/knex-db';
import { DBService } from './service';

export type ProjectSearchCriteria = {
  keyword?: string;
  funding_agency?: number | number[];
  permit_number?: string | string[];
  start_date?: string;
  end_date?: string;
};

export class SearchService extends DBService<KnexDBConnection> {
  /**
   * Returns a Knex query builder that returns project_ids that match the provided search `criteria`.
   *
   * @param {ProjectSearchCriteria} criteria
   * @return {*}  {Knex.QueryBuilder<any, { project_id: number }>}
   * @memberof SearchService
   */
  findProjectIdsByCriteria(criteria: ProjectSearchCriteria): Knex.QueryBuilder<any, { project_id: number }[]> {
    const selectQuery = this.connection.trx.select('project.project_id').from('project');

    if (criteria.keyword) {
      selectQuery.or.whereILike('project.name', `%${criteria.keyword}%`);

      selectQuery.or.whereILike('project.coordinator_agency_name', `%${criteria.keyword}%`);

      selectQuery.fullOuterJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      selectQuery.fullOuterJoin(
        'investment_action_category',
        'project_funding_source.investment_action_category_id',
        'investment_action_category.investment_action_category_id'
      );
      selectQuery.fullOuterJoin(
        'funding_source',
        'investment_action_category.funding_source_id',
        'funding_source.funding_source_id'
      );
      selectQuery.or.whereILike('funding_source.name', `%${criteria.keyword}%`);
    }

    if (criteria.funding_agency) {
      selectQuery.fullOuterJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      selectQuery.fullOuterJoin(
        'investment_action_category',
        'project_funding_source.investment_action_category_id',
        'investment_action_category.investment_action_category_id'
      );
      selectQuery.fullOuterJoin(
        'funding_source',
        'investment_action_category.funding_source_id',
        'funding_source.funding_source_id'
      );

      selectQuery.and.where('funding_source.funding_source_id', criteria.funding_agency);
    }

    if (criteria.permit_number) {
      selectQuery.fullOuterJoin('permit', 'project.project_id', 'permit.project_id');

      selectQuery.and.whereIn(
        'permit.number',
        (Array.isArray(criteria.permit_number) && criteria.permit_number) || [criteria.permit_number]
      );
    }

    if (criteria.start_date) {
      selectQuery.and.where('project.start_date', '>=', criteria.start_date);
    }

    if (criteria.end_date) {
      selectQuery.and.where('project.end_date', '<=', criteria.end_date);
    }

    selectQuery.groupBy('project.project_id');

    return selectQuery;
  }
}
