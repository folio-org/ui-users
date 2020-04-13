import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Callout } from '@folio/stripes/components';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stripesConnect } from '@folio/stripes/core';

import CommentRequiredForm from './CommentRequiredForm';

class CommentRequiredSettings extends React.Component {
  static manifest = Object.freeze({
    recordId: {},
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
      accumulate: 'true',
      PUT: {
        path: 'comments/%{recordId}',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      recordId: PropTypes.shape({
        replace: PropTypes.func,
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
  };

  componentDidMount() {
    const {
      mutator: { commentRequired }
    } = this.props;

    commentRequired.GET().then(records => {
      const settings = {
        paid: false,
        waived: false,
        transferredManually: false,
        refunded: false
      };
      if (records.length === 0) {
        commentRequired.POST(settings);
      }
    });
  }

  onSave = (values) => {
    const {
      mutator: {
        commentRequired,
        recordId,
      }
    } = this.props;

    const commentMessage = <FormattedMessage id="ui-users.comment.message" />;
    commentRequired.GET().then(records => {
      const body = {
        id: records[0].id,
        ...values
      };
      recordId.replace(records[0].id);
      return body;
    }).then((b) => {
      commentRequired.PUT(b);
    }).then(() => {
      this.callout.sendCallout({ message: commentMessage });
    });
  }

  render() {
    const hasLoadedComment = _.get(this.props.resources, ['commentRequired', 'hasLoaded'], false);
    if (hasLoadedComment === false) return <div />;

    const settings = _.get(this.props.resources, ['commentRequired', 'records', 0], {});
    const initialValues = {
      paid: (settings.paid && settings.paid !== 'false' ? 'true' : 'false'),
      waived: (settings.waived && settings.waived !== 'false' ? 'true' : 'false'),
      refunded: (settings.refunded && settings.refunded !== 'false' ? 'true' : 'false'),
      transferredManually: (settings.transferredManually && settings.transferredManually !== 'false' ? 'true' : 'false'),
    };

    return (
      <div style={{ width: '100%' }}>
        <CommentRequiredForm
          {...this.props}
          initialValues={initialValues}
          onSubmit={(values) => { this.onSave(values); }}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}
export default injectIntl(stripesConnect(CommentRequiredSettings));
