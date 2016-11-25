import React from 'react'
import { connect } from 'stripes-connect';
import Pane from '@folio/stripes-components/lib/Pane'
import Button from '@folio/stripes-components/lib/Button'
import KeyValue from '@folio/stripes-components/lib/KeyValue'
import {Row, Col} from 'react-bootstrap'
import TextField from '@folio/stripes-components/lib/TextField'
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList'
import Icon from '@folio/stripes-components/lib/Icon'



class ViewUser extends React.Component{
  static manifest = {
    user: {
      type: 'okapi',
      path: 'users/:userid'
    }
  };

  render () {
    const { fineHistory, data: {user} } =  this.props;
    if (!user || user.length==0) return <div/>;
    return (
      <Pane defaultWidth="fill">
        <Row>
          <Col xs={8} >
            <Row>
              <Col xs={12}>
                <h2>{user[0].personal.full_name}</h2>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <KeyValue label="Email" value={user[0].personal.email_primary}/>
              </Col>
            </Row>
          </Col>
          <Col xs={4} >
            <img className="floatEnd" src="http://placehold.it/175x175"/>
          </Col>
        </Row>
        <br/>
        <hr/>
        <br/>
        <Row>
        <Col xs={3}>
          <h3 className="marginTopHalf">Fines</h3>
        </Col>
        <Col xs={4} sm={3}>
            <TextField 
              rounded 
              endControl={<Button buttonStyle="fieldControl"><Icon icon='clearX'/></Button>}
              startControl={<Icon icon='search'/>}
              placeholder="Search"
              />
              
        </Col>
        <Col xs={5} sm={6}>
          <Button align="end" bottomMargin0 >View Full History</Button>
        </Col>
        </Row>
        <MultiColumnList fullWidth contentData={fineHistory} />
      </Pane>
    );
  }
}

export default connect(ViewUser, 'users');
