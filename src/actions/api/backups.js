import { fetch } from '~/fetch';
import {
  makeFetchPage,
  makeFetchItem,
} from '~/api-store';

export const UPDATE_BACKUPS = '@@backups/UPDATE_BACKUPS';
export const UPDATE_BACKUP = '@@backups/UPDATE_BACKUP';

export const fetchBackups = makeFetchPage(UPDATE_BACKUPS, 'linodes', 'backups');
export const fetchBackup = makeFetchItem(UPDATE_BACKUP, 'backup', 'linodes', 'backups');

function makeBackupAction(action) {
  return (id) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = fetch(token, `/linodes/${id}/backups/${action}`, { method: 'POST' });
    const json = await response.json();
    dispatch({ type: UPDATE_BACKUP, backup: json });
  };
}

export const enableBackup = makeBackupAction('enable');
export const cancelBackup = makeBackupAction('cancel');
