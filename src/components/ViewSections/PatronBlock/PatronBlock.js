import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import {
  Row,
  Col,
  Accordion,
  Icon,
  MultiColumnList,
  Button,
  Headline
} from '@folio/stripes/components';
import moment from 'moment';

class PatronBlock extends React.Component {
  static manifest = Object.freeze({
    userPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=userId=:{id}',
      DELETE: {
        path: 'manualblocks/%{activeRecord.id}'
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    resources: PropTypes.shape({
      userPatronBlocks: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      userPatronBlocks: PropTypes.shape({
        DELETE: PropTypes.func,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func,
    }),
    onClickViewPatronBlock: PropTypes.func,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    const { intl: { formatMessage } } = props;

    this.sortMap = {
      [formatMessage({ id: 'ui-users.blocks.columns.type' })]: f => f.type,
      [formatMessage({ id: 'ui-users.blocks.columns.desc' })]: f => f.desc,
      [formatMessage({ id: 'ui-users.blocks.columns.blocked' })]: f => f.renewals,
    };


    this.state = {
      sortOrder: [
        formatMessage({ id: 'ui-users.blocks.columns.type' }),
        formatMessage({ id: 'ui-users.blocks.columns.desc' }),
        formatMessage({ id: 'ui-users.blocks.columns.blocked' }),
      ],
      sortDirection: ['desc', 'asc'],
    };
  }

  componentDidUpdate(prevProps) {
    const prevBlocks = _.get(prevProps.resources, ['userPatronBlocks', 'records'], []);
    const patronBlocks = _.get(this.props.resources, ['userPatronBlocks', 'records'], []);
    if (!_.isEqual(prevBlocks, patronBlocks)) {
      const expirated = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isBefore(moment().format())) || [];
      expirated.forEach(block => {
        this.props.mutator.activeRecord.update({ id: block.id });
        this.props.mutator.userPatronBlocks.DELETE({ id: block.id });
      });
    }
  }

  onSort(e, meta) {
    if (!this.sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[1]];
      sortDirection = ['asc', sortDirection[1]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }
    this.setState({ sortOrder, sortDirection });
  }

  onRowClick(e, row) {
    if ((e.target.type !== 'button') && (e.target.tagName !== 'IMG')) {
      this.props.onClickViewPatronBlock(e, 'edit', row);
    }
  }


  getPatronFormatter() {
    const { intl: { formatMessage } } = this.props;

    return {
      'Type': f => f.type,
      'Display description': f => f.desc,
      'Blocked actions': f => `${f.borrowing ? [formatMessage({ id: 'ui-users.blocks.columns.borrowing' })] : ''}${f.renewals && f.borrowing ? ', ' : ''}${f.renewals ? [formatMessage({ id: 'ui-users.blocks.columns.renewals' })] : ''}${(f.requests && f.renewals) || (f.borrowing && f.requests) ? ', ' : ''}${f.requests ? [formatMessage({ id: 'ui-users.blocks.columns.requests' })] : ''}`,
    };
  }

  render() {
    const props = this.props;
    const {
      expanded,
      onToggle,
      accordionId,
      patronBlocks,
      intl : { formatMessage }
    } = props;
    const {
      sortOrder,
      sortDirection
    } = this.state;
    const contentData = _.orderBy(patronBlocks, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const visibleColumns = [
      'Type',
      'Display description',
      'Blocked actions',
    ];
    const buttonDisabled = this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    const displayWhenOpen =
      <Button disabled={!buttonDisabled} onClick={e => { props.onClickViewPatronBlock(e, 'add'); }}>
        {formatMessage({ id: 'ui-users.blocks.buttons.add' })}
      </Button>;
    const items =
      <MultiColumnList
        contentData={contentData}
        formatter={this.getPatronFormatter()}
        visibleColumns={visibleColumns}
        onHeaderClick={this.onSort}
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
        onRowClick={this.onRowClick}
        columnWidths={{
          'Type': 100,
          'Display description': 350,
          'Blocked actions': 250
        }}
      />;
    const title =
      <Row>
        <Col><Headline style={{ 'marginLeft': '8px' }} size="large" tag="h3"><FormattedMessage id="ui-users.blocks.label" /></Headline></Col>
        <Col>{(props.hasPatronBlocks) ? <Icon size="medium" icon="exclamation-circle" status="error" /> : ''}</Col>
      </Row>;
    return (
      <Accordion
        open={patronBlocks.length > 0 ? true : expanded}
        id={accordionId}
        onToggle={onToggle}
        label={title}
        displayWhenOpen={displayWhenOpen}
      >
        <Row><Col xs>{buttonDisabled && items}</Col></Row>
      </Accordion>

    );
  }
}

export default injectIntl(PatronBlock);
