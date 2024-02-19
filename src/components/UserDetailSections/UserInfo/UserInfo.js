import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {Img} from 'react-image'
import {
  Row,
  Col,
  KeyValue,
  Accordion,
  Headline,
  NoValue,
  FormattedDate,
  Loading,
} from '@folio/stripes/components';

import { ViewMetaData } from '@folio/stripes/smart-components';
import { useStripes } from '@folio/stripes/core';
import css from './UserInfo.css';
import { USER_TYPE_FIELD } from '../../../constants';
import profilePicThumbnail from '../../../../icons/profilePicThumbnail.png';
import { isAValidUUID } from '../../util/util';

import { useProfilePicture } from '../../../hooks';

const UserInfo = (props) => {
  const {
    user,
    patronGroup,
    settings,
    expanded,
    accordionId,
    onToggle
  } = props;
  const profilePictureLink = user?.personal?.profilePictureLink;
  const stripes = useStripes();
  const intl = useIntl();
  const userStatus = (user?.active ?
    <FormattedMessage id="ui-users.active" /> :
    <FormattedMessage id="ui-users.inactive" />);
  const hasProfilePicture = Boolean(profilePictureLink);
  /**
   * Profile Picture Link can be
   * 1. an id(uuid) of profile picture stored in database or
   * 2. a link to an image - a url
   */
  const isProfilePictureLinkAURL = !isAValidUUID(profilePictureLink);
  const profilePicturesEnabled = Boolean(settings.length) && settings[0].enabled;
  const hasViewProfilePicturePerm = stripes.hasPerm('ui-users.profile-pictures.view');
  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink });

  const renderProfilePic = () => {
    const profilePictureSrc = isProfilePictureLinkAURL ? profilePictureLink : 'data:;base64,' + profilePictureData;
    const imgSrc = isFetching || !hasProfilePicture ? profilePicThumbnail : profilePictureSrc;

    return (
    isFetching ? <Loading /> :  
    <Img
      className={css.profilePlaceholder}
      alt={intl.formatMessage({ id: 'ui-users.information.profilePicture' })}
      src={imgSrc}
      loader={<Loading />}
    />
    )
  };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={(
        <Headline
          size="large"
          tag="h3"
        >
          <FormattedMessage id="ui-users.information.userInformation" />
        </Headline>)}
    >
      <Row>
        <Col xs={12}>
          <ViewMetaData metadata={user?.metadata} />
        </Col>
      </Row>
      <Row>
        <Col xs={profilePicturesEnabled && hasViewProfilePicturePerm ? 9 : 12}>
          <Row>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.lastName" />}
                value={get(user, ['personal', 'lastName'], '')}
              />
            </Col>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.firstName" />}
                value={get(user, ['personal', 'firstName'], '')}
              />
            </Col>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.middleName" />}
                value={get(user, ['personal', 'middleName'], '')}
              />
            </Col>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.preferredName" />}
                value={get(user, ['personal', 'preferredFirstName']) || <NoValue />}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.patronGroup" />}
                value={patronGroup.group}
              />
            </Col>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.status" />}
                value={userStatus}
              />
            </Col>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.expirationDate" />}
                value={user.expirationDate ? <FormattedDate value={user.expirationDate} /> : '-'}
              />
            </Col>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.barcode" />}
                value={get(user, ['barcode'], '')}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.information.userType" />}
                value={get(user, [USER_TYPE_FIELD], '')}
              />
            </Col>
          </Row>
        </Col>

        {
          profilePicturesEnabled &&
          hasViewProfilePicturePerm &&
            <Col xs={3}>
              <Row>
                <Col xs={12}>
                  <KeyValue
                    label={<FormattedMessage id="ui-users.information.profilePicture" />}
                    value={renderProfilePic()}
                  />
                </Col>
              </Row>
            </Col>
        }
      </Row>
    </Accordion>
  );
};

UserInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  patronGroup: PropTypes.object.isRequired,
  settings: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default UserInfo;
