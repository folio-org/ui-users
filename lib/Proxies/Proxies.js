import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pluggable from '@folio/stripes-components/lib/Pluggable';

import { getFullName, getRowURL, getAnchoredRowFormatter } from '../../util';

export default class Proxies extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    history: PropTypes.object,
    proxies: PropTypes.arrayOf(PropTypes.object),
    onAdd: PropTypes.func,
    parentMutator: PropTypes.shape({
      proxiesFor: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
    }).isRequired,
    editable: PropTypes.bool,
  };

  static manifest = Object.freeze({
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    proxiesFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
    this.addProxy = this.addProxy.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onSelectRow(event, user) {
    this.props.history.push(getRowURL(user));
  }

  addProxy(selectedUser) {
    const { user, parentMutator } = this.props;
    const data = {
      userId: user.id,
      proxyUserId: selectedUser.id,
      meta: {},
    };

    parentMutator.proxiesFor.POST(data).then(() => this.props.onAdd());
  }

  render() {
    const proxies = this.props.proxies;
    const disableRecordCreation = true;
    const proxyFormatter = {
      Proxy: pr => getFullName(pr),
    };

    return (
      <div>
        <Row>
          <Col xs={12}>
            <MultiColumnList
              id="list-proxies"
              formatter={proxyFormatter}
              rowFormatter={getAnchoredRowFormatter}
              visibleColumns={['Proxy']}
              contentData={proxies}
              isEmptyMessage="No proxies found"
              onRowClick={this.onSelectRow}
            />
          </Col>
        </Row>
        { this.props.editable &&
        <Row className="marginTopHalf">
          <Col xs={12}>
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              {...this.props}
              dataKey="proxies"
              searchLabel="&#43; Add Proxy"
              searchButtonStyle="primary"
              selectUser={this.addProxy}
              visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
              disableRecordCreation={disableRecordCreation}
            />
          </Col>
        </Row>}
      </div>
    );
  }
}
