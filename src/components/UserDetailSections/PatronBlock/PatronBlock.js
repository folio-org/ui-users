import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import moment from 'moment';

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

import { calculateSortParams } from '../../util';

class PatronBlock extends React.Component {
  static manifest = Object.freeze({
    manualPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks',
      accumulate: 'true',
      fetch: false,
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
    intl: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    expanded: PropTypes.bool,
    accordionId: PropTypes.string,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    automatedPatronBlocks: PropTypes.arrayOf(PropTypes.object),
    manualPatronBlocks: PropTypes.arrayOf(PropTypes.object),
    hasPatronBlocks: PropTypes.bool,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      manualPatronBlocks: PropTypes.shape({
        DELETE: PropTypes.func,
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }),
    user: PropTypes.object,
  };

  static defaultProps = {
    patronBlocks: [],
    automatedPatronBlocks: [],
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
    };
  }

  componentDidMount() {
    const {
      mutator: {
        manualPatronBlocks,
      },
      user,
      onToggle,
      expanded,
      accordionId,
      automatedPatronBlocks,
    } = this.props;
    const query = `userId==${user.id}`;

    manualPatronBlocks.reset();
    manualPatronBlocks.GET({ params: { query } })
      .then(records => {
        const blocks = records.filter(p => moment(moment(p.expirationDate).endOf('day')).isSameOrAfter(moment().endOf('day')));
        if ((blocks.length > 0 && !expanded) || (!blocks.length && expanded)) {
          onToggle({ id: accordionId });
        }
      });

    if ((automatedPatronBlocks.length && !expanded) || (!automatedPatronBlocks.length && expanded)) {
      onToggle({ id: accordionId });
    }
  }

  onSort(e, meta) {
    if (!this.sortMap[meta.alias]) return;

    const {
      sortOrder,
      sortDirection,
    } = this.state;

    this.setState(calculateSortParams({
      sortOrder,
      sortDirection,
      sortValue: meta.alias,
      secondarySortOrderIndex: 1,
      secondarySortDirectionIndex: 1,
    }));
  }

  onRowClick(e, row) {
    const {
      history,
      match: { params }
    } = this.props;

    if (!row.type) {
      return;
    }

    const permAbled = this.props.stripes.hasPerm('ui-users.patron_blocks');

    if (permAbled === true && (e.target.type !== 'button') && (e.target.tagName !== 'IMG')) {
      history.push(`/users/${params.id}/patronblocks/edit/${row.id}`);
    }
  }

  getPatronFormatter() {
    const {
      intl: {
        formatMessage
      },
    } = this.props;

    return {
      'Type': f => f?.type ?? <FormattedMessage id="ui-users.blocks.columns.automated.type" />,
      'Display description': f => f.desc || f.message,
      'Blocked actions': f => {
        const blockedActions = [];

        if (f.borrowing || f.blockBorrowing) {
          blockedActions.push([formatMessage({ id: 'ui-users.blocks.columns.borrowing' })]);
        }

        if (f.renewals || f.blockRenewals) {
          blockedActions.push([formatMessage({ id: 'ui-users.blocks.columns.renewals' })]);
        }

        if (f.requests || f.blockRequests) {
          blockedActions.push([formatMessage({ id: 'ui-users.blocks.columns.requests' })]);
        }

        return blockedActions.join(', ');
      }
    };
  }

  render() {
    const {
      expanded,
      onToggle,
      accordionId,
      patronBlocks,
      hasPatronBlocks,
      match: { params },
    } = this.props;
    const {
      sortOrder,
      sortDirection
    } = this.state;
    let contentData = patronBlocks.filter(p => moment(moment(p.expirationDate).endOf('day')).isSameOrAfter(moment().endOf('day')));
    contentData = _.orderBy(contentData, ['metadata.createdDate'], ['desc']);
    const visibleColumns = [
      'Type',
      'Display description',
      'Blocked actions',
    ];

    const buttonDisabled = this.props.stripes.hasPerm('ui-users.patron_blocks');
    const displayWhenOpen =
      <Button id="create-patron-block" disabled={!buttonDisabled} to={{ pathname: `/users/${params.id}/patronblocks/create` }}>
        <FormattedMessage id="ui-users.blocks.buttons.add" />
      </Button>;
    const items =
      <MultiColumnList
        id="patron-block-mcl"
        interactive={false}
        contentData={contentData}
        formatter={this.getPatronFormatter()}
        visibleColumns={visibleColumns}
        onHeaderClick={this.onSort}
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
        onRowClick={this.onRowClick}
        columnWidths={{
          'Type': '100px',
          'Display description': '350px',
          'Blocked actions': '250px'
        }}
      />;
    const title =
      <Headline size="large" tag="h3">
        <FormattedMessage id="ui-users.settings.patronBlocks" />
        {(hasPatronBlocks) ? <Icon size="medium" icon="exclamation-circle" status="error" /> : ''}
      </Headline>;

    return (
      <Accordion
        open={!_.isEmpty(patronBlocks)}
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
