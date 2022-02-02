import * as occurrence_create from './occurrence-create';
import * as occurrence_view from './occurrence-view';
import * as project_attachments from './project-attachments';
import * as project_create from './project-create';
import * as project_update from './project-update';
import * as project_view from './project-view';
import * as user from './user';
import * as gcnotify from './gcnotify';

export const models = {
  project: {
    ...project_attachments,
    ...project_create,
    ...project_update,
    ...project_view
  },
  occurrence: {
    ...occurrence_create,
    ...occurrence_view
  },
  user: {
    ...user
  },
  gcnotify: {
    ...gcnotify
  }
};
