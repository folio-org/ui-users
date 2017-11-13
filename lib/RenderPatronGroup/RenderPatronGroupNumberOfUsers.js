import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export class RenderPatronGroupNumberOfUsers extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      users: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      users: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      })
    }).isRequired
  };

  static defaultProps = {

  };

  static manifest = Object.freeze({
    users: {
      type: 'okapi',
      path: 'users',
      accumulate: 'false',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
    };
  }

  componentDidMount() {
    const { mutator, item } = this.props;
    if(item.id) {
      mutator.users.reset();
      mutator.users.GET({ params: {
        limit: 0,
        query: `patronGroup=${item.id}`,
        facets: 'patronGroup'
      }}).then((records) => {
        this.setState({
          value: records.totalRecords,
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
