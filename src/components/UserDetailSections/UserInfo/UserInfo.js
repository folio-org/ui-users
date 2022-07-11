import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Row,
  Col,
  FormattedUTCDate,
  KeyValue,
  Accordion,
  Headline,
  NoValue,
} from '@folio/stripes/components';

import { ViewMetaData } from '@folio/stripes/smart-components';
import css from './UserInfo.css';
import appIcon from '../../../../icons/app.png';

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
    const {
      user,
      patronGroup,
      settings,
      expanded,
      accordionId,
      onToggle,
    } = this.props;
    const userStatus = (user?.active ?
      <FormattedMessage id="ui-users.active" /> :
      <FormattedMessage id="ui-users.inactive" />);
    const hasProfilePicture = (settings.length && settings[0].value === 'true');

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
            <this.cViewMetaData metadata={user.metadata} />
          </Col>
        </Row>
        <Row>
          <Col xs={hasProfilePicture ? 9 : 12}>
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
                  value={user.expirationDate ? <FormattedUTCDate value={user.expirationDate} /> : '-'}
                />
              </Col>
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-users.information.barcode" />}
                  value={get(user, ['barcode'], '')}
                />
              </Col>
            </Row>
          </Col>

          {hasProfilePicture === true &&
            <Col xs={3}>
              <Row>
                <Col xs={12}>
                  <img className={`floatEnd ${css.profilePlaceholder}`} src={appIcon} alt="presentation" />
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
