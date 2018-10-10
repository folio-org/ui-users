import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  KeyValue,
  Accordion,
  Headline
} from '@folio/stripes/components';

import { ViewMetaData } from '@folio/stripes/smart-components';

class UserInfo extends React.Component {
  static propTypes = {
    expanded: PropTypes.bool,
    stripes: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    settings: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  constructor(props) {
    super(props);

    this.cViewMetaData = props.stripes.connect(ViewMetaData);
  }

  render() {
    const { user, patronGroup, settings, expanded, accordionId, onToggle, stripes: { intl }, stripes } = this.props;
    const userStatus = (get(user, ['active'], '') ? 'active' : 'inactive');
    const hasProfilePicture = (settings.length && settings[0].value === 'true');

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3">{intl.formatMessage({ id: 'ui-users.information.userInformation' })}</Headline>}
      >
        <Row>
          <Col xs={12}>
            <this.cViewMetaData metadata={user.metadata} />
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
