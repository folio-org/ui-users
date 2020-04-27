import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  forIn,
  isNumber,
} from 'lodash';

import { stripesConnect } from '@folio/stripes/core';
import { Callout } from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import LimitsForm from './LimitsForm';
import css from '../patronBlocks.css';

class Limits extends Component {
  static manifest = Object.freeze({
    patronBlockLimitId: {},
    patronBlockLimits: {
      type: 'okapi',
      records: 'patronBlockLimits',
      GET: {
        path: 'patron-block-limits?limit=1500',
      },
      POST: {
        path: 'patron-block-limits',
      },
      PUT: {
        path: 'patron-block-limits',
      },
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      patronBlockLimits: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      patronBlockLimits: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }).isRequired,
      patronBlockLimitId: PropTypes.object.isRequired,
    }).isRequired,
    patronBlockConditions: PropTypes.arrayOf(
      PropTypes.object
    ).isRequired,
    patronBlockLimits: PropTypes.arrayOf(
      PropTypes.object
    ).isRequired,
    patronGroupId: PropTypes.string.isRequired,
    patronGroup: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      currentPatronGroupLimits: []
    };
    this.callout = React.createRef();
  }

  componentDidMount() {
    this.getCurrentPatronGroupLimits();
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getCurrentPatronGroupLimits = () => {
    const {
      patronGroupId: currentPatronGroupId,
      patronBlockLimits,
    } = this.props;
    const currentPatronGroupLimits = patronBlockLimits.filter(({ patronGroupId }) => patronGroupId === currentPatronGroupId);

    this.setState({ currentPatronGroupLimits });
  }

  normializeValue = (value) => {
    if (!isNumber(value) || value === 0) {
      return null;
    }

    return value;
  }

  findPatronGroupLimit = (blockConditionId, currentPatronGroupId) => {
    const { currentPatronGroupLimits } = this.state;

    const foundLimit = currentPatronGroupLimits.find(({ patronGroupId, conditionId }) => {
      return conditionId === blockConditionId && patronGroupId === currentPatronGroupId;
    });

    return foundLimit;
  }

  getInitialValues = () => {
    const {
      patronGroupId: currentPatronGroupId,
      patronBlockConditions
    } = this.props;
    const initialLimits = {};

    patronBlockConditions.forEach(({ id }) => {
      const values = this.findPatronGroupLimit(id, currentPatronGroupId);

      if (values?.conditionId) {
        initialLimits[values.conditionId] = values.value;
      }
    });

    return initialLimits;
  }

  saveLimits = (value) => {
    const {
      mutator,
      patronGroupId: currentPatronGroupId,
    } = this.props;
    const promises = [];
    let limitPromise;

    forIn(value, (limitValue, blockConditionId) => {
      const foundLimit = this.findPatronGroupLimit(blockConditionId, currentPatronGroupId);

      if (foundLimit?.value === limitValue) return;

      const limitValueNumber = parseFloat(limitValue);

      if (foundLimit) {
        mutator.patronBlockLimitId.update(foundLimit.id);
        limitPromise = mutator.patronBlockLimits.PUT({
          ...foundLimit,
          value: this.normializeValue(limitValueNumber),
        });
      } else {
        limitPromise = mutator.patronBlockLimits.POST({
          patronGroupId: currentPatronGroupId,
          conditionId: blockConditionId,
          value: this.normializeValue(limitValueNumber),
        });
      }

      promises.push(limitPromise);
    });

    return promises;
  }

  onSubmit = (value) => {
    const { patronGroup } = this.props;
    const limits = this.saveLimits(value);
    const showSuccessMessage = (
      <SafeHTMLMessage
        id="ui-users.settings.limits.callout.message"
        values={{ patronGroup }}
      />
    );
    const showErrorMessage = <FormattedMessage id="ui-users.settings.limits.callout.error" />;

    if (this.callout) {
      Promise.all(limits)
        .then(() => this.callout.current.sendCallout({
          type: 'success',
          message: showSuccessMessage
        }))
        .catch(() => {
          this.callout.current.sendCallout({
            type: 'error',
            message: showErrorMessage
          });

          return Promise.reject();
        });
    }
  }

  render() {
    const {
      patronGroup,
      patronGroupId,
      patronBlockConditions,
    } = this.props;

    if (!this._isMounted) return null;

    return (
      <section className={css.partonBlockWrapperHolder}>
        <div className={css.partonBlockWrapper}>
          <LimitsForm
            patronGroup={patronGroup}
            patronGroupId={patronGroupId}
            patronBlockConditions={patronBlockConditions}
            initialValues={this.getInitialValues()}
            onSubmit={this.onSubmit}
          />

          <Callout ref={this.callout} />
        </div>
      </section>
    );
  }
}

export default stripesConnect(Limits);
