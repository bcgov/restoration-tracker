import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { isValidElement, ReactElement, useContext } from 'react';
import { useParams } from 'react-router';
import { isAuthenticated } from 'utils/authUtils';

interface IGuardProps<T = never> {
  /**
   * An optional backup ReactElement to render if the guard fails.
   *
   * @memberof IGuardProps
   */
  fallback?: ((...args: T[]) => ReactElement) | ReactElement;
}

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles OR
 * at least 1 of the specified valid project roles.
 *
 * Note: assumes a url param `id` exists and represents a project id.
 *
 * @param {*} props
 * @return {*}
 */
export const RoleGuard: React.FC<
  { validSystemRoles: SYSTEM_ROLE[]; validProjectRoles: PROJECT_ROLE[] } & IGuardProps<number>
> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const urlParams = useParams();

  const hasSystemRole = keycloakWrapper?.hasSystemRole(props.validSystemRoles);

  if (hasSystemRole) {
    // User has a matching system role
    return <>{props.children}</>;
  }

  const projectId = Number(urlParams['id']);
  const hasProjectRole = keycloakWrapper?.hasProjectRole(projectId, props.validProjectRoles);

  if (hasProjectRole) {
    // User has a matching project role
    return <>{props.children}</>;
  }

  // User has no matching system role or project role
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }

    return props.fallback(projectId);
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles.
 *
 * @param {*} props
 * @return {*}
 */
export const SystemRoleGuard: React.FC<{ validSystemRoles: SYSTEM_ROLE[] } & IGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const hasSystemRole = keycloakWrapper?.hasSystemRole(props.validSystemRoles);

  if (hasSystemRole) {
    // User has a matching system role
    return <>{props.children}</>;
  }

  // User has no matching system role
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }

    return props.fallback();
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid project roles.
 *
 * Note: assumes a url param `id` exists and represents a project id.
 *
 * @param {*} props
 * @return {*}
 */
export const ProjectRoleGuard: React.FC<{ validProjectRoles: PROJECT_ROLE[] } & IGuardProps<number>> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const urlParams = useParams();

  const projectId = Number(urlParams['id']);
  const hasProjectRole = keycloakWrapper?.hasProjectRole(projectId, props.validProjectRoles);

  if (hasProjectRole) {
    // User has a matching project role
    return <>{props.children}</>;
  }

  // User has no matching project role
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }

    return props.fallback(projectId);
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is authenticated (logged in).
 *
 * @param {*} props
 * @return {*}
 */
export const AuthGuard: React.FC<IGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (isAuthenticated(keycloakWrapper)) {
    // User is logged in
    return <>{props.children}</>;
  }

  // User is not logged in
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }

    return props.fallback();
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is not authenticated (logged in).
 *
 * @param {*} props
 * @return {*}
 */
export const UnAuthGuard: React.FC<IGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!isAuthenticated(keycloakWrapper)) {
    // User is not logged in
    return <>{props.children}</>;
  }

  // User is logged in
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }

    return props.fallback();
  }

  return <></>;
};
