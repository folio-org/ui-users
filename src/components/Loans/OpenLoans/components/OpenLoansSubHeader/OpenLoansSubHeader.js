import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FormattedMessage } from 'react-intl';

import {
  Button,
  Dropdown,
  DropdownMenu,
  ExportCsv,
  Checkbox,
} from '@folio/stripes/components';

import ActionsBar from '../../../components/ActionsBar/ActionsBar';
import Label from '../../../../Label/Label';

class OpenLoansSubHeader extends React.Component {
  static propTypes = {
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    columnMapping: PropTypes.object.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
    checkedLoans: PropTypes.object.isRequired,
    renewSelected: PropTypes.func.isRequired,
    showChangeDueDateDialog: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      toggleDropdownState: false,
    };

    this.bulkActionsTooltip = <FormattedMessage id="ui-users.bulkActions.tooltip" />;
    this.renewString = <FormattedMessage id="ui-users.renew" />;
    this.changeDueDateString = <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />;
    this.dropdownStyle = { float: 'right', marginLeft: '10px' };
    this.spanStyle = { display: 'flex' };
    this.excludeKeys = ['id', 'userId', 'itemId'];
  }

  renderCheckboxList(columnMapping) {
    const {
      visibleColumns,
      toggleColumn,
    } = this.props;

    return visibleColumns.filter((columnObj) => Object.keys(columnMapping)
      .includes(columnObj.title))
      .map((e, i) => {
        const columnName = columnMapping[e.title];

        return (
          <li key={`columnitem-${i}`}>
            <Checkbox
              label={columnName}
              name={columnName}
              id={columnName}
              onChange={() => toggleColumn(e.title)}
              checked={e.status}
            />
          </li>
        );
      });
  }

  onDropdownClick = () => {
    this.setState(({ toggleDropdownState }) => ({
      toggleDropdownState: !toggleDropdownState
    }));
  };

  render() {
    const {
      loans,
      renewSelected,
      showChangeDueDateDialog,
      checkedLoans,
      columnMapping,
    } = this.props;

    const {
      toggleDropdownState,
    } = this.state;

    const noSelectedLoans = _.size(checkedLoans) === 0;
    const resultCount = <FormattedMessage id="ui-users.resultCount" values={{ count: loans.length }} />;

    return (
      <ActionsBar
        contentStart={
          <span style={this.spanStyle}>
            <Label>
              {resultCount}
            </Label>
            <Dropdown
              id="columnsDropdown"
              style={this.dropdownStyle}
              group
              pullRight
              onToggle={this.onDropdownClick}
              open={toggleDropdownState}
            >
              <Button
                data-role="toggle"
                align="end"
                bottomMargin0
                aria-haspopup="true"
              >
              Select Columns
              </Button>
              <DropdownMenu
                data-role="menu"
                aria-label="available permissions"
              >
                <ul>
                  {this.renderCheckboxList(columnMapping)}
                </ul>
              </DropdownMenu>
            </Dropdown>
          </span>
        }
        contentEnd={
          <span>
            <Button
              marginBottom0
              id="renew-all"
              disabled={noSelectedLoans}
              title={noSelectedLoans ? this.bulkActionsTooltip : this.renewString}
              onClick={renewSelected}
            >
              {this.renewString}
            </Button>
            <Button
              marginBottom0
              id="change-due-date-all"
              disabled={noSelectedLoans}
              title={noSelectedLoans ? this.bulkActionsTooltip : this.changeDueDateString}
              onClick={showChangeDueDateDialog}
            >
              {this.changeDueDateString}
            </Button>
            <ExportCsv
              data={loans}
              excludeKeys={this.excludeKeys}
            />
          </span>
        }
      />
    );
  }
}

export default OpenLoansSubHeader;
