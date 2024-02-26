import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Img } from 'react-image';

import { Loading } from '@folio/stripes/components';

import { isAValidURL } from '../util/util';
import profilePicThumbnail from '../../../icons/profilePicThumbnail.png';
import { useProfilePicture } from '../../hooks';

import css from './ProfilePicture.css';

const ProfilePicture = ({ profilePictureLink, croppedLocalImage }) => {
  const intl = useIntl();
  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink });
  const hasProfilePicture = Boolean(croppedLocalImage) || Boolean(profilePictureLink);
  /**
   * Profile Picture Link can be
   * 1. an id(uuid) of profile picture stored in database or
   * 2. a link to an image - a url
   */
  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);
  const profilePictureSrc = croppedLocalImage || (isProfilePictureLinkAURL ? profilePictureLink : 'data:;base64,' + profilePictureData);
  const imgSrc = !hasProfilePicture ? profilePicThumbnail : profilePictureSrc;

  if (isFetching) {
    return <span data-testid="profile-picture-loader"> <Loading /> </span>;
  }

  return (
    <Img
      data-testid="profile-picture"
      className={css.profilePlaceholder}
      alt={intl.formatMessage({ id: 'ui-users.information.profilePicture' })}
      src={imgSrc}
      loader={<Loading />}
    />
  );
};

ProfilePicture.propTypes = {
  profilePictureLink: PropTypes.string.isRequired,
  croppedLocalImage: PropTypes.string,
};

export default ProfilePicture;
