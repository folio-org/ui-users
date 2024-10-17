import { USER_TYPES } from '../constants';

const getPatronDuplicatesQuery = ({ email }) => {
  return `personal.email=="${email}" and type=="${USER_TYPES.PATRON}"`;
};

export default getPatronDuplicatesQuery;
