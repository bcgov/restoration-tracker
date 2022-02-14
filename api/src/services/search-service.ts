import { getKnexQueryBuilder } from '../database/db';
import { DBService } from './service';

export type ProjectSearchCriteria = {
  keyword?: string;
  funding_agency?: number | number[];
  permit_number?: string | string[];
  start_date?: string;
  end_date?: string;
};

export class SearchService extends DBService {
  /**
   * Returns a Knex query builder that returns project_ids that match the provided search `criteria`.
   *
   * @param {ProjectSearchCriteria} criteria
   * @return {*}  {Knex.QueryBuilder<any, { project_id: number }[]>}
   * @memberof SearchService
   */
  async findProjectIdsByCriteria(criteria: ProjectSearchCriteria) {
    const queryBuilder = getKnexQueryBuilder<any, { project_id: number }>()
      .select('project.project_id')
      .from('project');

    if (criteria.keyword) {
      queryBuilder.or.whereILike('project.name', `%${criteria.keyword}%`);

      queryBuilder.or.whereILike('project.coordinator_agency_name', `%${criteria.keyword}%`);

      queryBuilder.leftJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      queryBuilder.leftJoin(
        'investment_action_category',
        'project_funding_source.investment_action_category_id',
        'investment_action_category.investment_action_category_id'
      );
      queryBuilder.leftJoin(
        'funding_source',
        'investment_action_category.funding_source_id',
        'funding_source.funding_source_id'
      );
      queryBuilder.or.whereILike('funding_source.name', `%${criteria.keyword}%`);
    }

    if (criteria.funding_agency) {
      queryBuilder.leftJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      queryBuilder.leftJoin(
        'investment_action_category',
        'project_funding_source.investment_action_category_id',
        'investment_action_category.investment_action_category_id'
      );
      queryBuilder.leftJoin(
        'funding_source',
        'investment_action_category.funding_source_id',
        'funding_source.funding_source_id'
      );

      queryBuilder.and.where('funding_source.funding_source_id', criteria.funding_agency);
    }

    if (criteria.permit_number) {
      queryBuilder.leftJoin('permit', 'project.project_id', 'permit.project_id');

      queryBuilder.and.whereIn(
        'permit.number',
        (Array.isArray(criteria.permit_number) && criteria.permit_number) || [criteria.permit_number]
      );
    }

    if (criteria.start_date) {
      queryBuilder.and.where('project.start_date', '>=', criteria.start_date);
    }

    if (criteria.end_date) {
      queryBuilder.and.where('project.end_date', '<=', criteria.end_date);
    }

    queryBuilder.groupBy('project.project_id');

    const response = await this.connection.knex<{ project_id: number }>(queryBuilder);

    return response.rows;
  }
}
