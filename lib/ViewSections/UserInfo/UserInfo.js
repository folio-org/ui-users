import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MetaSection from '@folio/stripes-components/lib/MetaSection';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

import { getFullName } from '../../../util';

class UserInfo extends React.Component {
  static manifest = Object.freeze({
    createdBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{user.metadata.createdByUserId})',
    },
    updatedBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{user.metadata.updatedByUserId})',
    },
  });

  static propTypes = {
    expanded: PropTypes.bool,
    stripes: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    settings: PropTypes.arrayOf(PropTypes.object).isRequired,
    resources: PropTypes.shape({
      createdBy: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  };

  render() {
    const { user, patronGroup, settings, resources, expanded, accordionId, onToggle, stripes: { intl }, stripes } = this.props;
    const userStatus = (get(user, ['active'], '') ? 'active' : 'inactive');
    const hasProfilePicture = (settings.length && settings[0].value === 'true');
    const createdBy = (resources.createdBy || {}).records || [];
    const updatedBy = (resources.updatedBy || {}).records || [];

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={intl.formatMessage({ id: 'ui-users.information.userInformation' })}
      >
        <Row>
          <Col xs={12}>
            <MetaSection
              id="userInfoRecordMeta"
              contentId="userInfoRecordMetaContent"
              lastUpdatedDate={(user.metadata && user.metadata.updatedDate) || ''}
              createdDate={(user.metadata && user.metadata.createdDate) || ''}
              lastUpdatedBy={getFullName(updatedBy[0])}
              createdBy={getFullName(createdBy[0])}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={hasProfilePicture ? 9 : 12}>
            <Row>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.lastName' })} value={get(user, ['personal', 'lastName'], '')} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.firstName' })} value={get(user, ['personal', 'firstName'], '')} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.middleName' })} value={get(user, ['personal', 'middleName'], '')} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.barcode' })} value={get(user, ['barcode'], '')} />
              </Col>
            </Row>

            <Row>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.patronGroup' })} value={patronGroup.group} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.status' })} value={userStatus} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.expirationDate' })} value={stripes.formatDate(get(user, ['expirationDate'], ''))} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-users.information.username' })} value={get(user, ['username'], '')} />
              </Col>
            </Row>
          </Col>

          {hasProfilePicture === true &&
            <Col xs={3}>
              <Row>
                <Col xs={12}>
                  <img className="floatEnd" src="http://placehold.it/100x100" alt="presentation" />
                </Col>
              </Row>
            </Col>
          }
        </Row>
      </Accordion>
    );
  }
}

export default UserInfo;
