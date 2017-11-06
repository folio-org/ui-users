import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pluggable from '@folio/stripes-components/lib/Pluggable';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';
import { getFullName, getRowURL, getAnchoredRowFormatter } from './util';

export default class ProxyPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    history: PropTypes.object,
    resources: PropTypes.shape({
      sponsors: PropTypes.object,
      proxies: PropTypes.object,
    }).isRequired,

    mutator: PropTypes.shape({
      proxiesFor: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
      sponsorsFor: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
      proxies: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
      sponsors: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
    }).isRequired,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
    // if `editable` is true, component will be in 'edit' mode. (read-only by default)
    editable: PropTypes.bool,
  };

  static manifest = Object.freeze({
    sponsors: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
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
    sponsorsFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
    this.addSponsor = this.addSponsor.bind(this);
    this.addProxy = this.addProxy.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  componentDidMount() {
    this.getProxies();
    this.getSponsors();
  }

  onSelectRow(event, user) {
    this.props.history.push(getRowURL(user));
  }

  getProxies() {
    const { mutator, user } = this.props;
    const query = `query=(userId=${user.id})`;

    mutator.proxies.reset();
    mutator.proxiesFor.reset();
    mutator.proxiesFor.GET({ params: { query } })
    .then((records) => {
      if (!records.length) return;
      const ids = records.map(pf => `id=${pf.proxyUserId}`).join(' or ');
      mutator.proxies.GET({ params: { query: `query=(${ids})` } });
    });
  }

  getSponsors() {
    const { mutator, user } = this.props;
    const query = `query=(proxyUserId=${user.id})`;

    mutator.sponsors.reset();
    mutator.sponsorsFor.reset();
    mutator.sponsorsFor.GET({ params: { query } })
    .then((records) => {
      if (!records.length) return;
      const ids = records.map(pf => `id=${pf.userId}`).join(' or ');
      mutator.sponsors.GET({ params: { query: `query=(${ids})` } });
    });
  }

  addSponsor(selectedUser) {
    const { user, mutator } = this.props;
    const data = {
      userId: selectedUser.id,
      proxyUserId: user.id,
      meta: {},
    };

    mutator.sponsorsFor.POST(data)
    .then(() => this.getSponsors());
  }

  addProxy(selectedUser) {
    const { user, mutator } = this.props;
    const data = {
      userId: user.id,
      proxyUserId: selectedUser.id,
      meta: {},
    };

    mutator.proxiesFor.POST(data)
      .then(() => this.getProxies());
  }

  render() {
    const resources = this.props.resources;
    const sponsors = (resources.sponsors || {}).records || [];
    const proxies = (resources.proxies || {}).records || [];
    const disableRecordCreation = true;
    const sponsorFormatter = {
      Sponsor: sp => getFullName(sp),
    };
    const proxyFormatter = {
      Proxy: pr => getFullName(pr),
    };

    const { onToggle, accordionId, expanded } = this.props;

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        displayWhenClosed={
          <Badge>{proxies.length + sponsors.length}</Badge>
        }
        label={
          <h2>Proxy</h2>
        }
      >
        <Row>
          <Col xs={12}>
            <MultiColumnList
              id="list-sponsors"
              formatter={sponsorFormatter}
              rowFormatter={getAnchoredRowFormatter}
              visibleColumns={['Sponsor']}
              contentData={sponsors}
              isEmptyMessage="No sponsors found"
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
              dataKey="sponsors"
              searchLabel="&#43; Add Sponsor"
              searchButtonStyle="primary"
              selectUser={this.addSponsor}
              visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
              disableRecordCreation={disableRecordCreation}
            />
          </Col>
        </Row>
        }
        <hr />
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
        </Row>
        }
      </Accordion>);
  }
}
