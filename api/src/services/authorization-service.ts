import { PROJECT_ROLE, SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ProjectParticipantObject, UserObject } from '../models/user';
import { getLogger } from '../utils/logger';
import { DBService } from './service';
import { UserService } from './user-service';

const defaultLog = getLogger('request-handlers/security/authorization');

export enum AuthorizeOperator {
  AND = 'and',
  OR = 'or'
}

export interface AuthorizeBySystemRoles {
  validSystemRoles: SYSTEM_ROLE[];
  discriminator: 'SystemRole';
}

export interface AuthorizeByProjectRoles {
  validProjectRoles: PROJECT_ROLE[];
  projectId: number;
  discriminator: 'ProjectRole';
}

export interface AuthorizeBySystemUser {
  discriminator: 'SystemUser';
}

export type AuthorizeRule = AuthorizeBySystemRoles | AuthorizeByProjectRoles | AuthorizeBySystemUser;

export type AuthorizeConfigOr = {
  [AuthorizeOperator.AND]?: never;
  [AuthorizeOperator.OR]: AuthorizeRule[];
};

export type AuthorizeConfigAnd = {
  [AuthorizeOperator.AND]: AuthorizeRule[];
  [AuthorizeOperator.OR]?: never;
};

export type AuthorizationScheme = AuthorizeConfigAnd | AuthorizeConfigOr;

export class AuthorizationService extends DBService {
  _userService = new UserService(this.connection);
  _systemUser: UserObject | undefined = undefined;

  constructor(connection: IDBConnection, init?: { systemUser?: UserObject }) {
    super(connection);

    this._systemUser = init?.systemUser;
  }

  get systemUser(): UserObject | undefined {
    return this._systemUser;
  }

  /**
   * Execute the `authorizationScheme` against the current user, and return `true` if they have access, `false` otherwise.
   *
   * @param {UserObject} systemUserObject
   * @param {AuthorizationScheme} authorizationScheme
   * @param {IDBConnection} connection
   * @return {*}  {Promise<boolean>} `true` if the `authorizationScheme` indicates the user has access, `false` otherwise.
   */
  async executeAuthorizationScheme(authorizationScheme: AuthorizationScheme): Promise<boolean> {
    if (authorizationScheme.and) {
      return (await this.executeAuthorizeConfig(authorizationScheme.and)).every((item) => item);
    } else {
      return (await this.executeAuthorizeConfig(authorizationScheme.or)).some((item) => item);
    }
  }

  /**
   * Execute an array of `AuthorizeRule`, returning an array of boolean results.
   *
   * @param {AuthorizeRule[]} authorizeRules
   * @return {*}  {Promise<boolean[]>}
   */
  async executeAuthorizeConfig(authorizeRules: AuthorizeRule[]): Promise<boolean[]> {
    const authorizeResults: boolean[] = [];

    for (const authorizeRule of authorizeRules) {
      switch (authorizeRule.discriminator) {
        case 'SystemRole':
          authorizeResults.push(await this.authorizeBySystemRole(authorizeRule));
          break;
        case 'ProjectRole':
          authorizeResults.push(await this.authorizeByProjectRole(authorizeRule));
          break;
        case 'SystemUser':
          authorizeResults.push(await this.authorizeBySystemUser());
          break;
      }
    }

    return authorizeResults;
  }

  /**
   * Check if the user has the system administrator role.
   *
   * @return {*}  {boolean} `true` if the user is a system administrator, `false` otherwise.
   */
  async authorizeSystemAdministrator(): Promise<boolean> {
    const systemUserObject = this._systemUser || (await this.getSystemUserObject());

    if (!systemUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._systemUser = systemUserObject;

    return systemUserObject.role_names.includes(SYSTEM_ROLE.SYSTEM_ADMIN);
  }

  /**
   * Check that the user has at least one of the valid system roles specified in `authorizeSystemRoles.validSystemRoles`.
   *
   * @param {AuthorizeBySystemRoles} authorizeSystemRoles
   * @return {*}  {boolean} `true` if the user has at least one valid system role role, or no valid system roles are
   * specified; `false` otherwise.
   */
  async authorizeBySystemRole(authorizeSystemRoles: AuthorizeBySystemRoles): Promise<boolean> {
    if (!authorizeSystemRoles) {
      // Cannot verify user roles
      return false;
    }

    const systemUserObject = this._systemUser || (await this.getSystemUserObject());

    if (!systemUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._systemUser = systemUserObject;

    if (systemUserObject.record_end_date) {
      //system user has an expired record
      return false;
    }

    // Check if the user has at least 1 of the valid roles
    return AuthorizationService.userHasValidRole(authorizeSystemRoles.validSystemRoles, systemUserObject?.role_names);
  }

  /**
   * Check that the user has at least on of the valid project roles specified in `authorizeProjectRoles.validProjectRoles`.
   *
   * @param {AuthorizeByProjectRoles} authorizeProjectRoles
   * @param {IDBConnection} connection
   * @return {*}  {Promise<boolean>} `Promise<true>` if the user has at least one valid project role, or no valid project
   * roles are specified; `Promise<false>` otherwise.
   */
  async authorizeByProjectRole(authorizeProjectRoles: AuthorizeByProjectRoles): Promise<boolean> {
    if (!authorizeProjectRoles || !authorizeProjectRoles.projectId) {
      // No project id to verify roles for
      return false;
    }

    if (!authorizeProjectRoles?.validProjectRoles.length) {
      // No valid rules specified
      return true;
    }

    const projectUserObject = await this.getProjectUserObject(authorizeProjectRoles.projectId);

    if (!projectUserObject) {
      defaultLog.warn({ label: 'getProjectUser', message: 'project user was null' });
      return false;
    }

    return AuthorizationService.userHasValidRole(
      authorizeProjectRoles.validProjectRoles,
      projectUserObject.project_role_name
    );
  }

  /**
   * Check if the user is a valid system user.
   *
   * @return {*}  {Promise<boolean>} `Promise<true>` if the user is a valid system user, `Promise<false>` otherwise.
   */
  async authorizeBySystemUser(): Promise<boolean> {
    const systemUserObject = this._systemUser || (await this.getSystemUserObject());

    if (!systemUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._systemUser = systemUserObject;

    // User is a valid system user
    return true;
  }

  /**
   * Compares an array of user roles against an array of valid roles.
   *
   * @param {(string | string[])} validRoles valid roles to match against
   * @param {(string | string[])} userRoles user roles to check against the valid roles
   * @return {*} {boolean} true if the user has at least 1 of the valid roles or no valid roles are specified, false
   * otherwise
   */
  static userHasValidRole = function (validRoles: string | string[], userRoles: string | string[]): boolean {
    if (!validRoles || !validRoles.length) {
      return true;
    }

    if (!Array.isArray(validRoles)) {
      validRoles = [validRoles];
    }

    if (!Array.isArray(userRoles)) {
      userRoles = [userRoles];
    }

    for (const validRole of validRoles) {
      if (userRoles.includes(validRole)) {
        return true;
      }
    }

    return false;
  };

  async getSystemUserObject(): Promise<UserObject | null> {
    let systemUserWithRoles;

    try {
      systemUserWithRoles = await this.getSystemUserWithRoles();
    } catch {
      return null;
    }

    if (!systemUserWithRoles) {
      return null;
    }

    return systemUserWithRoles;
  }

  /**
   * Finds a single user based on their keycloak token information.
   *
   * @return {*}  {(Promise<UserObject | null>)}
   */
  async getSystemUserWithRoles(): Promise<UserObject | null> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      return null;
    }

    return this._userService.getUserById(systemUserId);
  }

  async getProjectUserObject(projectId: number): Promise<ProjectParticipantObject | null> {
    let projectUserWithRoles;

    try {
      projectUserWithRoles = await this.getProjectUserWithRoles(projectId);
    } catch {
      return null;
    }

    if (!projectUserWithRoles) {
      return null;
    }

    return projectUserWithRoles;
  }

  /**
   * Get a user's project roles, for a single project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<ProjectParticipantObject | null>}
   */
  async getProjectUserWithRoles(projectId: number): Promise<ProjectParticipantObject | null> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      return null;
    }

    const response = await this._userService.getUserProjectParticipation(systemUserId, projectId);

    return (response?.length && response[0]) || null;
  }
}
