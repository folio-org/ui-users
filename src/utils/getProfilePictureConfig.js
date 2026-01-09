import { PROFILE_PICTURE_CONFIG_KEY } from '../constants';

const getProfilePictureConfig = ({ resources }) => {
  return (resources.settings.records[0]?.settings || []).find(setting => setting.key === PROFILE_PICTURE_CONFIG_KEY)?.value || {};
};

export default getProfilePictureConfig;
