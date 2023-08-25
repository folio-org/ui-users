export const USER_TYPES = {
  staff: 'staff',
  patron: 'patron',
  shadow: 'shadow',
};

export const checkIfConsortiumEnabled = stripes => {
  return stripes.hasInterface('consortia');
};
