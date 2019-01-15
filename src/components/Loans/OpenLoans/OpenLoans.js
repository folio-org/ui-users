import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { MultiColumnList } from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import css from './OpenLoans.css';

class OpenLoans extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    sortMap: PropTypes.object.isRequired,
    loanFormatter: PropTypes.object.isRequired,
    columnMapping: PropTypes.object.isRequired,
    sortOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
    possibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      sortDirection: [
        'asc',
        'asc',
      ],
      sortOrder: props.sortOrder,
    };

    this.columnWidths = {
      '  ': 35,
      'title': 150,
      'itemStatus': 100,
      'dueDate': 140,
      'requests': 90,
      'barcode': 130,
      'Fee/Fine': 100,
      'Call number': 120,
      'Contributors': 160,
      'renewals': 70,
      'loanPolicy': 100,
      'location': 100,
      'loanDate': 100,
      ' ': 50
    };
    this.columnOverflow = { ' ': true };
    this.permissions = { allRequests: 'ui-users.requests.all' };
  }

  onSort = (e, meta) => {
    const { sortMap } = this.props;

    if (!sortMap[meta.alias]) return;

    let {
      sortOrder,
      sortDirection,
    } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[0]];
      sortDirection = ['asc', sortDirection[0]];
    } else {
      const direction = (sortDirection[0] === 'desc')
        ? 'asc'
        : 'desc';

      sortDirection = [direction, sortDirection[1]];
    }

    this.setState(
      {
        sortOrder,
        sortDirection,
      }
    );
  };

  onRowClick = (e, row) => {
    const { onClickViewLoanActionsHistory } = this.props;

    if (e.target.type !== 'button') {
      onClickViewLoanActionsHistory(e, row);
    }
  };

  getVisibleColumns = () => {
    const {
      visibleColumns,
      possibleColumns,
      stripes,
    } = this.props;

    const visibleColumnsMap = visibleColumns.reduce((map, e) => {
      map[e.title] = e.status;

      return map;
    }, {});

    let columnsToDisplay = possibleColumns.filter((e) => {
      return (visibleColumnsMap[e] === undefined || visibleColumnsMap[e] === true);
    });

    if (!stripes.hasPerm(this.permissions.allRequests)) {
      columnsToDisplay = columnsToDisplay.filter(col => col !== 'requests');
    }

    return columnsToDisplay;
  };

  render() {
    const {
      sortOrder,
      sortDirection,
    } = this.state;

    const {
      loans,
      columnMapping,
      loanFormatter,
      sortMap,
    } = this.props;

    const loansSorted = _.orderBy(
      loans,
      [
        sortMap[sortOrder[0]],
        sortMap[sortOrder[1]],
      ],
      sortDirection,
    );

    return (
      <div className={css.root}>
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={loanFormatter}
          contentData={loansSorted}
          columnMapping={columnMapping}
          totalCount={loans.length}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          columnOverflow={this.columnOverflow}
          columnWidths={this.columnWidths}
          visibleColumns={this.getVisibleColumns()}
          onRowClick={this.onRowClick}
          onHeaderClick={this.onSort}
        />
      </div>
    );
  }
}

export default OpenLoans;
