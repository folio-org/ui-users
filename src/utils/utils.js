// eslint-disable-next-line import/prefer-default-export
export const navigateToUserView = (history, userId) => {
  history.push({
    pathname: `/users/view/${userId}`
  });
};
