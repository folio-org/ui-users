import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

import { getFullName, getRowURL, getAnchoredRowFormatter } from '../../../util';
import css from './ProxyItem.css';

export default class ProxyItem extends React.Component {
  static propTypes = {
    proxy: PropTypes.object,
  };

	render() {
		const { proxy } = this.props;
		const proxyLink = (<Link to={`/users/view/${proxy.id}`}>{getFullName(proxy)}</Link>);

		return (
			<div className={css.item}>
				<LayoutHeader level={3} title={proxyLink} noActions />
				<Row className={css.content}>
        	<Col xs={4}>
	         	<Row>
	           	<Col xs={12}>
	            	<KeyValue label="Relationship Status" value={_.get(proxy, ['meta', 'status'], '-')} />
	           	</Col>
	         	</Row>
	         </Col>
	         <Col xs={4}>
	         	<Row>
	           	<Col xs={12}>
	            	<KeyValue label="Expiration Date" value={_.get(proxy, ['meta', 'expirationDate'], '-')} />
	           	</Col>
	         	</Row>
	        </Col>
	      </Row>
	      <Row>
        	<Col xs={4}>
	         	<Row>
	           	<Col xs={12}>
	            	<KeyValue label="Proxy can request for sponsor" value={_.get(proxy, ['meta', 'requestForSponsor'], '-')} />
	           	</Col>
	         	</Row>
	         </Col>
	         <Col xs={4}>
	         	<Row>
	           	<Col xs={12}>
	            	<KeyValue label="Notifications sent to" value={_.get(proxy, ['meta', 'notificationsTo'], '-')} />
	           	</Col>
	         	</Row>
	        </Col>
	        <Col xs={4}>
	         	<Row>
	           	<Col xs={12}>
	            	<KeyValue label="Fees/fines accrue to" value={_.get(proxy, ['meta', 'accrueTo'], '-')} />
	           	</Col>
	         	</Row>
	        </Col>
	      </Row>
				<br />
			</div>
		);
	}
}