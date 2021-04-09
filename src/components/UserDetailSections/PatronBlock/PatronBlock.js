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

import css from './PatronBlock.css';

const PATRON_BLOCKS_COLUMNS = {
  type: 'type',
  displayDescription: 'displayDescription',
  blockedActions: 'blockedActions',
};

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

    const pointerWrapper = (content, isManual) => (
      isManual
        ? <div className={css.pointerWrapper}>{content}</div>
        : content
    );

    return {
      [PATRON_BLOCKS_COLUMNS.type]: f => {
        const type = f?.type ?? <FormattedMessage id="ui-users.blocks.columns.automated.type" />;

        return pointerWrapper(type, f?.type);
      },
      [PATRON_BLOCKS_COLUMNS.displayDescription]: f => {
        const description = f.desc || f.message;

        return pointerWrapper(description, f?.type);
      },
      [PATRON_BLOCKS_COLUMNS.blockedActions]: f => {
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

        return pointerWrapper(blockedActions.join(', '), f?.type);
      }
    };
  }

  columnMapping = {
    [PATRON_BLOCKS_COLUMNS.type]: <FormattedMessage id="ui-users.blocks.columns.type" />,
    [PATRON_BLOCKS_COLUMNS.displayDescription]: <FormattedMessage id="ui-users.blocks.columns.desc" />,
    [PATRON_BLOCKS_COLUMNS.blockedActions]: <FormattedMessage id="ui-users.blocks.columns.blocked" />,
  };

  columnWidths = {
    [PATRON_BLOCKS_COLUMNS.type]: '100px',
    [PATRON_BLOCKS_COLUMNS.displayDescription]: '350px',
    [PATRON_BLOCKS_COLUMNS.blockedActions]: '250px',
  };

  visibleColumns = [
    PATRON_BLOCKS_COLUMNS.type,
    PATRON_BLOCKS_COLUMNS.displayDescription,
    PATRON_BLOCKS_COLUMNS.blockedActions,
  ];

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
        visibleColumns={this.visibleColumns}
        onHeaderClick={this.onSort}
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
        onRowClick={this.onRowClick}
        columnMapping={this.columnMapping}
        columnWidths={this.columnWidths}
      />;
    const title =
      <Headline size="large" tag="h3">
        <FormattedMessage id="ui-users.settings.patronBlocks" />
        {(hasPatronBlocks) ? <Icon size="medium" icon="exclamation-circle" status="error" /> : ''}
      </Headline>;

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
