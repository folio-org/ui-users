import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import {
  Row,
  Col,
  Accordion,
  Icon,
  MultiColumnList,
  Button,
  Headline
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';

import moment from 'moment';

class PatronBlock extends React.Component {
  static manifest = Object.freeze({
    patronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks',
      accumulate: 'true',
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockId}',
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func,
    }),
    history: PropTypes.object,
    match: PropTypes.object,
    intl: intlShape.isRequired,
    onToggle: PropTypes.func,
    expanded: PropTypes.bool,
    accordionId: PropTypes.string,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      patronBlocks: PropTypes.shape({
        DELETE: PropTypes.func,
      }),
    }),
    user: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    const { intl: { formatMessage } } = props;

    this.sortMap = {
      [formatMessage({ id: 'ui-users.blocks.columns.type' })]: f => f.type,
      [formatMessage({ id: 'ui-users.blocks.columns.desc' })]: f => f.desc,
      [formatMessage({ id: 'ui-users.blocks.columns.blocked' })]: f => f.renewals,
    };


    this.state = {
      sortOrder: [
        formatMessage({ id: 'ui-users.blocks.columns.type' }),
        formatMessage({ id: 'ui-users.blocks.columns.desc' }),
        formatMessage({ id: 'ui-users.blocks.columns.blocked' }),
      ],
      sortDirection: ['desc', 'asc'],
      submitting: false,
    };
  }

  componentDidMount() {
    const { mutator: { patronBlocks }, user, onToggle, expanded, accordionId } = this.props;
    const query = `userId=${user.id}`;
    patronBlocks.GET({ params: { query } }).then(records => {
      const blocks = records.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
      if ((blocks.length > 0 && !expanded) || (!blocks.length && expanded)) {
        onToggle({ id: accordionId });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { patronBlocks } = this.props;
    const prevBlocks = prevProps.patronBlocks;
    const { submitting } = this.state;
    const prevExpirated = prevBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const expirated = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];

    if (prevExpirated.length > 0 && expirated.length === 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: false });
    }

    if (expirated.length > 0 && !submitting) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: true });
      expirated.forEach(p => {
        this.props.mutator.activeRecord.update({ blockId: p.id });
        this.props.mutator.patronBlocks.DELETE({ id: p.id });
      });
    }
  }

  onSort(e, meta) {
    if (!this.sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[1]];
      sortDirection = ['asc', sortDirection[1]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }
    this.setState({ sortOrder, sortDirection });
  }

  onRowClick(e, row) {
    const {
      history,
      match: { params }
    } = this.props;

    const permAbled = this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    if (permAbled === true && (e.target.type !== 'button') && (e.target.tagName !== 'IMG')) {
      // this.props.onClickViewPatronBlock(e, 'edit', row);
      history.push(`/users/${params.id}/patronblocks/edit/${row.id}`);
    }
  }

  getPatronFormatter() {
    const { intl: { formatMessage } } = this.props;

    return {
      'Type': f => f.type,
      'Display description': f => f.desc,
      'Blocked actions': f => `${f.borrowing ? [formatMessage({ id: 'ui-users.blocks.columns.borrowing' })] : ''}${f.renewals && f.borrowing ? ', ' : ''}${f.renewals ? [formatMessage({ id: 'ui-users.blocks.columns.renewals' })] : ''}${(f.requests && f.renewals) || (f.borrowing && f.requests) ? ', ' : ''}${f.requests ? [formatMessage({ id: 'ui-users.blocks.columns.requests' })] : ''}`,
    };
  }

  render() {
    const props = this.props;
    const {
      expanded,
      onToggle,
      accordionId,
      patronBlocks,
      match: { params },
    } = props;
    const {
      sortOrder,
      sortDirection
    } = this.state;
    let contentData = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
    contentData = _.orderBy(contentData, ['metadata.createdDate'], ['asc']);
    const visibleColumns = [
      'Type',
      'Display description',
      'Blocked actions',
    ];
    const buttonDisabled = this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    const displayWhenOpen =
      <Button disabled={!buttonDisabled} to={{ pathname: `/users/${params.id}/patronblocks/create`, state:{ referrer: 'userdetail' } }}>
        <FormattedMessage id="ui-users.blocks.buttons.add" />
      </Button>;
    const items =
      <MultiColumnList
        contentData={contentData}
        formatter={this.getPatronFormatter()}
        visibleColumns={visibleColumns}
        onHeaderClick={this.onSort}
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
        onRowClick={this.onRowClick}
        columnWidths={{
          'Type': 100,
          'Display description': 350,
          'Blocked actions': 250
        }}
      />;
    const title =
      <Row>
        <Col><Headline style={{ 'marginLeft': '8px' }} size="large" tag="h3"><FormattedMessage id="ui-users.blocks.label" /></Headline></Col>
        <Col>{(props.hasPatronBlocks) ? <Icon size="medium" icon="exclamation-circle" status="error" /> : ''}</Col>
      </Row>;
    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={title}
        displayWhenOpen={displayWhenOpen}
      >
        <Row><Col xs>{items}</Col></Row>
      </Accordion>

    );
  }
}

export default stripesConnect(injectIntl(PatronBlock));
