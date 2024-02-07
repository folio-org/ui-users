import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { PROFILE_PIC_API } from '../../constants';
import { isAValidUUID } from '../../components/util/util';

const useProfilePicture = ({ profilePictureId }, options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'get-profile-picture-of-a-user' });
  const {
    isFetching,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, profilePictureId],
    () => {
      return ky.get(`${PROFILE_PIC_API}/${profilePictureId}`).json();
    },
    {
      enabled: Boolean(profilePictureId) && isAValidUUID(profilePictureId),
      ...options,
    }
  );

  return ({
    isLoading,
    isFetching,
    profilePictureData: data?.profile_picture_blob,
  });
};
export default useProfilePicture;
