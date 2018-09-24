import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@folio/stripes/components';
import { Modal } from '@folio/stripes/components';
import { MultiColumnList } from '@folio/stripes/components';
import { Row, Col } from '@folio/stripes/components';

class ItemLookup extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.object),
    onClose: PropTypes.func.isRequired,
    onChangeItem: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.onRowClick = this.onRowClick.bind(this);
    this.state = {
      selectedRow: {},
    };
  }

  onRowClick(e, row) {
    this.setState({
      selectedRow: row,
    });
  }

  render() {
    const items = this.props.items || [];

    return (
      <Modal
        open={this.props.open}
        label="Item Lookup"
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <Row>
          <Col xs>
            <MultiColumnList
              contentData={items}
              onRowClick={this.onRowClick}
              visibleColumns={['barcode', 'title']}
            />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Button onClick={(e) => { this.props.onChangeItem(this.state.selectedRow); this.props.onClose(e); }} disabled={!this.state.selectedRow.id}>Confirm</Button>
            <Button onClick={(e) => this.props.onClose(e)}>Cancel</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ItemLookup;
