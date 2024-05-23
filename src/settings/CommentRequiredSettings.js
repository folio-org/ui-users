import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Callout } from '@folio/stripes/components';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stripesConnect, TitleManager } from '@folio/stripes/core';

import CommentRequiredForm from './CommentRequiredForm';

import css from './CommentRequiredSettings.css';

class CommentRequiredSettings extends React.Component {
  static manifest = Object.freeze({
    record: {},
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
      accumulate: 'true',
      PUT: {
        path: 'comments/%{record.id}',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      record: PropTypes.shape({
        update: PropTypes.func,
      }),
      commentRequired: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        GET: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      commentRequired: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired
    }).isRequired,
    intl: PropTypes.object,
  };

  componentDidMount() {
    const {
      mutator: { commentRequired },
      stripes,
    } = this.props;

    commentRequired.GET().then(records => {
      const settings = {
        paid: false,
        waived: false,
        transferredManually: false,
        refunded: false
      };
      if (records.length === 0 && stripes.hasPerm('comments.item.post')) {
        commentRequired.POST(settings);
      }
    });
  }

  onSave = (values) => {
    const {
      mutator: {
        commentRequired,
        record,
      }
    } = this.props;

    const commentMessage = <FormattedMessage id="ui-users.comment.message" />;
    commentRequired.GET().then(records => {
      const body = {
        id: records[0].id,
        ...values
      };
      record.update({ id: records[0].id });
      return body;
    }).then((b) => {
      commentRequired.PUT(b);
    }).then(() => {
      this.callout.sendCallout({ message: commentMessage });
    });
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const hasLoadedComment = _.get(this.props.resources, ['commentRequired', 'hasLoaded'], false);
    if (hasLoadedComment === false) return <div />;

    const settings = _.get(this.props.resources, ['commentRequired', 'records', 0], {});
    const initialValues = {
      paid: (settings.paid && settings.paid !== 'false' ? 'true' : 'false'),
      waived: (settings.waived && settings.waived !== 'false' ? 'true' : 'false'),
      refunded: (settings.refunded && settings.refunded !== 'false' ? 'true' : 'false'),
      transferredManually: (settings.transferredManually && settings.transferredManually !== 'false' ? 'true' : 'false'),
    };
    const viewOnly = !this.props.stripes.hasPerm('ui-users.settings.comments.all');

    return (
      <TitleManager
        record={formatMessage({ id: 'ui-users.settings.commentRequired' })}
      >
        <div className={css.fullWidth}>
          <CommentRequiredForm
            {...this.props}
            initialValues={initialValues}
            onSubmit={(values) => { this.onSave(values); }}
            viewOnly={viewOnly}
          />
          <Callout ref={(ref) => { this.callout = ref; }} />
        </div>
      </TitleManager>
    );
  }
}
export default injectIntl(stripesConnect(CommentRequiredSettings));
