import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';

import Pluggable from '@folio/stripes-components/lib/Pluggable';

import { getFullName } from './util';

const propTypes = {
  resources: PropTypes.shape({
    sponorIds: PropTypes.object,
    sponsors: PropTypes.object,
  }).isRequired,
  mutator: PropTypes.shape({
    sponorIds: PropTypes.shape({
      replace: PropTypes.func,
    }),
  }).isRequired,
  user: PropTypes.object,
};

class ProxyPermissions extends React.Component {
  static manifest = Object.freeze({
    sponorIds: {},
    sponsors: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{sponorIds.query})',
    },
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(proxyFor=!{user.id})',
    },
  });

  componentWillReceiveProps(nextProps) {
    const { user, resources: { sponorIds, sponsors }, mutator } = nextProps;
    if (user.proxyFor && user.proxyFor.length && !sponorIds.query) {
      const query = user.proxyFor.map(id => `id=${id}`).join(' or ');
      mutator.sponorIds.replace({ query });
    }
  }

  selectUser() {
  }

  render() {
    const resources = this.props.resources;
    const sponsors = (resources.sponsors || {}).records || [];
    const proxies = (resources.proxies || {}).records || [];
    const formatter = {
      Sponsor: sp => getFullName(sp),
    };

    const disableUserCreation = true;

    return (<div>
      <hr />
      <Row>
        <Col xs={5}>
          <h3 className="marginTop0">Proxy Permissions</h3>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <MultiColumnList
            id="list-sponsors"
            formatter={formatter}
            visibleColumns={['Sponsor']}
            contentData={sponsors}
            isEmptyMessage="No sponsors found"
          />
        </Col>
      </Row>
      <Row className="marginTopHalf">
        <Col xs={12}>
          <Pluggable
            aria-haspopup="true"
            type="find-user"
            {...this.props}
            searchLabel="&#43; Add Sponsor"
            searchButtonStyle="primary"
            selectUser={this.selectUser}
            visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
            disableUserCreation={disableUserCreation} />
        </Col>
      </Row>
      <hr />

      <Row>
        <Col xs={12}>
          <MultiColumnList
            id="list-proxies"
            formatter={formatter}
            visibleColumns={['Sponsor']}
            contentData={proxies}
            isEmptyMessage="No proxies found"
          />
        </Col>
      </Row>
      <Row className="marginTopHalf">
        <Col xs={12}>
          <Pluggable
            aria-haspopup="true"
            type="find-user"
            {...this.props}
            searchLabel="&#43; Add Proxy"
            searchButtonStyle="primary"
            selectUser={this.selectUser}
            visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
            disableUserCreation={disableUserCreation} />
        </Col>
      </Row>
    </div>);
  }
}

ProxyPermissions.propTypes = propTypes;

export default ProxyPermissions;
