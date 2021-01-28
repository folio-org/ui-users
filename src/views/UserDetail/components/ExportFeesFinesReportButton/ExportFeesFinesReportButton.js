import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  Button,
  Icon,
} from '@folio/stripes/components';

import FeeFineReport from '../../../../components/data/reports/FeeFineReport';

class ExportFeesFinesReportButton extends React.Component {
  static propTypes = {
    feesFinesReportData: PropTypes.shape({
      patronGroup: PropTypes.string.isRequired,
      servicePoints: PropTypes.arrayOf(PropTypes.object).isRequired,
      feeFineActions:  PropTypes.arrayOf(PropTypes.object).isRequired,
      accounts: PropTypes.arrayOf(PropTypes.object).isRequired,
      loans: PropTypes.arrayOf(PropTypes.object).isRequired,
      user: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    callout: PropTypes.func,
    onToggle: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      exportReportInProgress: false,
    };
  }

  generateFeesFinesReport = () => {
    const {
      onToggle,
      intl,
      feesFinesReportData,
      callout,
    } = this.props;
    const {
      exportReportInProgress,
    } = this.state;

    if (exportReportInProgress) {
      return;
    }

    this.setState({
      exportReportInProgress: true,
    }, () => {
      callout.sendCallout({
        type: 'success',
        message: <FormattedMessage id="ui-users.reports.inProgress" />,
      });

      try {
        const report = new FeeFineReport({
          intl,
          data: feesFinesReportData,
        });
        report.toCSV();
      } catch (error) {
        if (error) {
          callout.sendCallout({
            type: 'error',
            message: <FormattedMessage id="ui-users.settings.limits.callout.error" />,
          });
        }
      } finally {
        this.setState({
          exportReportInProgress: false,
        });

        onToggle();
      }
    });
  };

  render() {
    const {
      feesFinesReportData: {
        feeFineActions,
      },
    } = this.props;

    return (
      <>
        <Button
          data-test-export-fee-fine-report
          buttonStyle="dropdownItem"
          onClick={this.generateFeesFinesReport}
          disabled={!feeFineActions.length}
        >
          <Icon icon="download">
            <FormattedMessage id="ui-users.accounts.exportFeesFines" />
          </Icon>
        </Button>
      </>
    );
  }
}

export default injectIntl(ExportFeesFinesReportButton);
