import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Callout } from '@folio/stripes/components';
import { injectIntl, FormattedMessage } from 'react-intl';

import CommentRequiredForm from './CommentRequiredForm';

class CommentRequiredSettings extends React.Component {
  static manifest = Object.freeze({
    recordId: {},
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
      POST: {
        path: 'comments',
      },
      PUT: {
        path: 'comments/%{recordId}',
      },
    },
  });

  static propTypes = {
    resources: PropTypes.object,
    mutator: PropTypes.shape({
      recordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      commentRequired: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }),
  };

  onSave = (values) => {
    const {
      resources,
      mutator: {
        commentRequired,
        recordId,
      }
    } = this.props;
    const settings = _.get(resources, ['commentRequired', 'records', 0], {});
    const commentMessage = <FormattedMessage id="ui-users.comment.message" />;
    delete settings.metadata;
    settings.paid = values.paid;
    settings.waived = values.waived;
    settings.transferredManually = values.transferredManually;
    settings.refunded = values.refunded;

    if (!settings.id) {
      commentRequired.POST(settings)
        .then(() => { this.callout.sendCallout({ message: commentMessage }); });
    } else {
      recordId.replace(settings.id);
      commentRequired.PUT(settings)
        .then(() => { this.callout.sendCallout({ message: commentMessage }); });
    }
  }

  render() {
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
export default injectIntl(CommentRequiredSettings);
