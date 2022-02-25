import SQL from 'sql-template-strings';
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
    // track which tables we have joined with already
    const joins: string[] = [];

    const queryBuilder = getKnexQueryBuilder<any, { project_id: number }>()
      .select('project.project_id')
      .from('project');

    if (criteria.keyword) {
      !joins.includes('project_funding_source') &&
        queryBuilder.leftJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      !joins.includes('investment_action_category') &&
        queryBuilder.leftJoin(
          'investment_action_category',
          'project_funding_source.investment_action_category_id',
          'investment_action_category.investment_action_category_id'
        );
      !joins.includes('funding_source') &&
        queryBuilder.leftJoin(
          'funding_source',
          'investment_action_category.funding_source_id',
          'funding_source.funding_source_id'
        );

      joins.push('project_funding_source', 'investment_action_category', 'funding_source');

      queryBuilder.and.where(function () {
        this.or.whereILike('project.name', `%${criteria.keyword}%`);
        this.or.whereILike('funding_source.name', `%${criteria.keyword}%`);
      });
    }

    if (criteria.funding_agency) {
      !joins.includes('project_funding_source') &&
        queryBuilder.leftJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      !joins.includes('investment_action_category') &&
        queryBuilder.leftJoin(
          'investment_action_category',
          'project_funding_source.investment_action_category_id',
          'investment_action_category.investment_action_category_id'
        );
      !joins.includes('funding_source') &&
        queryBuilder.leftJoin(
          'funding_source',
          'investment_action_category.funding_source_id',
          'funding_source.funding_source_id'
        );

      joins.push('project_funding_source', 'investment_action_category', 'funding_source');

      queryBuilder.and.whereIn(
        'funding_source.funding_source_id',
        (Array.isArray(criteria.funding_agency) && criteria.funding_agency) || [criteria.funding_agency]
      );
    }

    if (criteria.permit_number) {
      queryBuilder.leftJoin('permit', 'project.project_id', 'permit.project_id');

      queryBuilder.and.whereIn(
        'permit.number',
        (Array.isArray(criteria.permit_number) && criteria.permit_number) || [criteria.permit_number]
      );

      joins.push('permit');
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

  async findProjectIdsByProjectParticipation(systemUserId: number) {
    const sqlStatement = SQL`
      SELECT
        project.project_id
      FROM
        project
      LEFT JOIN
        project_participation
      ON
        project.project_id = project_participation.project_participation_id
      WHERE
        project_participation.system_user_id = ${systemUserId};
    `;

    const response = await this.connection.sql<{ project_id: number }>(sqlStatement);

    return response.rows;
  }
}
