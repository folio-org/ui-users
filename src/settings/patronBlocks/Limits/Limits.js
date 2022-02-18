import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  isNumber,
  keysIn,
  difference,
  without,
  isEmpty,
  concat,
} from 'lodash';

import { stripesConnect } from '@folio/stripes/core';
import { Callout } from '@folio/stripes/components';

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
      DELETE: {
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
        DELETE: PropTypes.func.isRequired,
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

  componentDidUpdate(prevProps) {
    const { patronBlockLimits: prevPatronBlockLimits } = prevProps;
    const { patronBlockLimits } = this.props;
    const differenceInPrevLimits = difference(prevPatronBlockLimits, patronBlockLimits);
    const differenceInCurrentLimits = difference(patronBlockLimits, prevPatronBlockLimits);
    const differenceInLimits = [...differenceInPrevLimits, ...differenceInCurrentLimits];

    if (!isEmpty(differenceInLimits)) {
      this.getCurrentPatronGroupLimits();
    }
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
    if (!isNumber(value)) {
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
    const initialValues = this.getInitialValues();
    const existedLimits = keysIn(initialValues);
    const receivedFromFormLimits = keysIn(value);
    const limitsToRemove = difference(existedLimits, receivedFromFormLimits);
    const limitsToCreate = difference(receivedFromFormLimits, existedLimits);
    const notUpdatedLimits = concat(limitsToCreate, limitsToCreate);
    const limitsToUpdate = without(receivedFromFormLimits, ...notUpdatedLimits);
    const promises = [];
    let limitPromise;

    if (!isEmpty(limitsToRemove)) {
      limitsToRemove.forEach((conditionId) => {
        const foundLimit = this.findPatronGroupLimit(conditionId, currentPatronGroupId);

        limitPromise = mutator.patronBlockLimits.DELETE({ id: foundLimit.id });

        promises.push(limitPromise);
      });
    }

    if (!isEmpty(limitsToCreate)) {
      limitsToCreate.forEach((conditionId) => {
        const foundLimit = this.findPatronGroupLimit(conditionId, currentPatronGroupId);

        if (!foundLimit) {
          const receivedValue = parseFloat(value[conditionId]);

          limitPromise = mutator.patronBlockLimits.POST({
            patronGroupId: currentPatronGroupId,
            conditionId,
            value: this.normializeValue(receivedValue),
          });

          promises.push(limitPromise);
        }
      });
    }

    if (!isEmpty(limitsToUpdate)) {
      limitsToUpdate.forEach((conditionId) => {
        const foundLimit = this.findPatronGroupLimit(conditionId, currentPatronGroupId);
        const receivedValue = parseFloat(value[conditionId]);

        if (foundLimit && (foundLimit.value !== receivedValue)) {
          limitPromise = mutator.patronBlockLimits.PUT({
            id: foundLimit.id,
            patronGroupId: foundLimit.patronGroupId,
            conditionId: foundLimit.conditionId,
            value: this.normializeValue(receivedValue),
          });

          promises.push(limitPromise);
        }
      });
    }

    return promises;
  }

  onSubmit = (value) => {
    const { patronGroup } = this.props;
    const limits = this.saveLimits(value);
    const showSuccessMessage = (
      <FormattedMessage
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
        <div
          data-test-limits-wrapper
          className={css.partonBlockWrapper}
        >
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
