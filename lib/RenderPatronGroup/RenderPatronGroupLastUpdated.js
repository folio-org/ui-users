import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export class RenderPatronGroupLastUpdated extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      createdBy: PropTypes.object,
      updatedBy: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      createdBy: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      updatedBy: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }).isRequired
  };

  static defaultProps = {

  };

  static manifest = Object.freeze({
    createdBy: {
      type: 'okapi',
      path: 'users/!{item.metadata.createdByUserId}',
      accumulate: 'false',
      fetch: false,
    },
    updatedBy: {
      type: 'okapi',
      path: 'users/!{item.metadata.updatedByUserId}',
      accumulate: 'false',
      fetch: false,
    }
  });

  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      item: undefined,
    };
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return [year, month < 10 ? "0" + month : month, day < 10 ? "0" + day : day].join("-")
  }

  buildValue(record) {
    let date = new Date(this.props.item.metadata.updatedDate);
    return this.formatDate(date) + " by " +
      record.personal.lastName + ", " +
      record.personal.firstName;
  }

  componentDidMount() {
    const { mutator, item } = this.props;
    if(item.id) {
      mutator.createdBy.reset();
      mutator.createdBy.GET();
      mutator.updatedBy.reset();
      mutator.updatedBy.GET().then((record) => {
        this.setState({
          value: this.buildValue(record),
          item: item,
        })
      });
    }
  }

  render() {
    return (
      <Col key={this.props.key} xs>{this.state.value}</Col>
    );
  }
}
