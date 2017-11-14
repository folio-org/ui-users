import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Button from '@folio/stripes-components/lib/Button';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';
import classNames from 'classnames';

import { Field } from 'redux-form';

import { getFullName } from '../../../util';
import css from './ExtendedInfo.css';

class ExtendedInfo extends React.Component {

  constructor() {
    super();
    this.state = { showPassword: false };
  }

  togglePassword() {
    this.setState({
      showPassword: !this.state.showPassword,
    });
  }

  render() {
    const { expanded, onToggle, accordionId,  initialValues } = this.props;


    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={
          <h2>Extended Information</h2>
        }
      >
        <Row>
          <Col xs={3}>
            <Field
              component={Datepicker}
              label="Date Enrolled"
              dateFormat="YYYY-MM-DD"
              name="enrollmentDate"
              id="adduser_enrollmentdate"
            />
          </Col>
          <Col xs={3}>
            <Field
              label="External System ID"
              name="externalSystemId"
              id="adduser_externalsystemid"
              component={TextField} fullWidth />
          </Col>
          <Col xs={3}>
            <Field
              component={Datepicker}
              label="Date of Birth"
              dateFormat="YYYY-MM-DD"
              name="personal.dateOfBirth"
              id="adduser_dateofbirth"
              backendDateStandard="YYYY-MM-DD"
            />
          </Col>
          <Col xs={3}>
            <Field label="FOLIO Record Number" name="id" id="adduser_id" readOnly component={TextField} fullWidth />
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            {!initialValues.id &&
              <div className="input-group">
                <Field label="Password" name="creds.password" id="pw" autoComplete="new-password" type={this.state.showPassword ? 'text' : 'password'} component={TextField} required fullWidth />
                <span className={classNames('input-group-btn', css.togglePw)}>
                  <Button buttonStyle="secondary hollow" id="toggle_pw_btn" onClick={() => this.togglePassword()}>
                    {this.state.showPassword ? <Glyphicon glyph="eye-open" /> : <Glyphicon glyph="eye-close" />}
                  </Button>
                </span>
              </div>
            }
          </Col>
        </Row>
      </Accordion>
    );
  }
}

ExtendedInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
};

export default ExtendedInfo;
