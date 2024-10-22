export const navigateToUserView = (history, userId) => {
  history.push({
    pathname: `/users/view/${userId}`
  });
};
