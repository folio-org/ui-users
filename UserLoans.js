import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@folio/stripes-components/lib/Button';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

class UserLoans extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
  };

  // "limit=1" on the openLoansCount and closedLoansCount fields is a hack
  // to get at the "totalRecords" field without pulling down too much other
  // data. Instead we should be able to construct a query to retrieve this
  // metadata directly without pulling any item records.
  // see https://issues.folio.org/browse/FOLIO-773
  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId=:{userid})&limit=100',
      },
    },
    openLoansCount: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans?query=(userId=:{userid} and status.name<>Closed)&limit=1',
      },
    },
    closedLoansCount: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans?query=(userId=:{userid} and status.name=Closed)&limit=1',
      },
    },
    userid: {},
  });

  render() {
    const resources = this.props.resources;
    const openLoansCount = _.get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0);
    const closedLoansCount = _.get(resources.closedLoansCount, ['records', '0', 'totalRecords'], 0);
    const { expanded, onToggle, accordionId } = this.props;

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={
          <h2 className="marginTop0"><FormattedMessage id="ui-users.loans.title" /></h2>
        }
        displayWhenOpen={
          <Button id="clickable-viewfullhistory" align="end" bottomMargin0 onClick={this.props.onClickViewOpenLoans}>View Loans</Button>
        }
      >
        <ul>
          <li><a id="clickable-viewcurrentloans" href="" onClick={this.props.onClickViewOpenLoans}>{ openLoansCount } <FormattedMessage id="ui-users.loans.openLoans" /></a></li>
          <li><a id="clickable-viewclosedloans" href="" onClick={this.props.onClickViewClosedLoans}>{ closedLoansCount } <FormattedMessage id="ui-users.loans.closedLoans" /></a></li>
        </ul>
      </Accordion>);
  }
}

export default UserLoans;
