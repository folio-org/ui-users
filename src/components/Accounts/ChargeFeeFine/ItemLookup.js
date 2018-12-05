import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Row,
  Col,
  Modal,
  MultiColumnList,
} from '@folio/stripes/components';

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

  onConfirm() {
    const {
      onChangeItem,
      onClose,
    } = this.props;

    const { selectedRow } = this.state;

    onChangeItem(selectedRow);
    onClose();
  }

  render() {
    const {
      onClose,
      items = [],
    } = this.props;

    return (
      <Modal
        open={this.props.open}
        label={<FormattedMessage id="ui-users.charge.itemLookup.modalLabel" />}
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
            <Button
              onClick={this.onConfirm}
              disabled={!this.state.selectedRow.id}
            >
              <FormattedMessage id="ui-users.charge.itemLookup.confirm" />
            </Button>
            <Button
              onClick={onClose}
            >
              <FormattedMessage id="ui-users.charge.itemLookup.cancel" />
            </Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ItemLookup;
