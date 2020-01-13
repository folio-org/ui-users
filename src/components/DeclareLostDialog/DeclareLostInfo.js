import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Layout,
  TextArea,
  Row,
  Col,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';

import SafeHTMLMessage from '@folio/react-intl-safe-html';

import css from './DeclareLostDialog.css';

class DeclareLostInfo extends React.Component {
  static manifest = Object.freeze({
    declareLost: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/loans/!{loan.id}/declare-item-lost',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      declareLost: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    loan: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: '',
    };
  }

  handleAdditionalInfoChange = (event) => {
    this.setState({ additionalInfo: event.target.value });
  };

  submitDeclareLost = async () => {
    const { additionalInfo } = this.state;

    const {
      mutator: {
        declareLost: {
          POST,
        }
      },
      onClose,
    } = this.props;

    await POST({ comment: additionalInfo });

    onClose();
  };

  render() {
    const {
      loan,
      onClose,
    } = this.props;
    const { additionalInfo } = this.state;

    return (
      <div>
        <Layout className="flex">
          <Layout className="flex">
            <SafeHTMLMessage
              id="ui-users.loans.declareLostDialogBody"
              values={{
                title: get(loan, 'item.title'),
                materialType: get(loan, 'item.materialType.name'),
                barcode: get(loan, 'item.barcode'),
              }}
            />
          </Layout>
        </Layout>
        <Row>
          <Col sm={12} className={css.additionalInformation}>
            <FormattedMessage id="ui-users.loans.declareLost.additionalInfoPlaceholder">
              {placeholder => (
                <TextArea
                  data-test-declare-lost-additional-info-textarea
                  label={<FormattedMessage id="ui-users.additionalInfo.label" />}
                  placeholder={placeholder}
                  required
                  onChange={this.handleAdditionalInfoChange}
                />
              )}
            </FormattedMessage>
          </Col>
        </Row>
        <Layout className="textRight">
          <Button
            data-test-declare-lost-dialog-cancel-button
            onClick={onClose}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            data-test-declare-lost-dialog-confirm-button
            buttonStyle="primary"
            disabled={!additionalInfo}
            onClick={this.submitDeclareLost}
          >
            <FormattedMessage id="ui-users.confirm" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default stripesConnect(DeclareLostInfo);
