import { USER_TYPES } from '../constants';

export const getPatronDuplicatesQuery = ({ email }) => {
  return `personal.email=="${email}" and type=="${USER_TYPES.PATRON}"`;
};
