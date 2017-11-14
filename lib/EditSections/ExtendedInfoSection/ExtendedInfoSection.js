import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Button from '@folio/stripes-components/lib/Button';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';

import { Field } from 'redux-form';

import css from './ExtendedInfoSection.css';

class ExtendedInfoSection extends React.Component {

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
    const { expanded, onToggle, accordionId, initialValues } = this.props;

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
              component={TextField} fullWidth
            />
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
        {!initialValues.id &&
          <Row>
            <Col xs={4}>
              <Field label="Password" name="creds.password" id="pw" autoComplete="new-password" type={this.state.showPassword ? 'text' : 'password'} component={TextField} required fullWidth />
            </Col>
            <Col xs={1}>
              <div className={css.togglePw}>
                <Button buttonStyle="secondary hollow" id="toggle_pw_btn" onClick={() => this.togglePassword()}>
                  {this.state.showPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
            </Col>
          </Row>
        }
      </Accordion>
    );
  }
}

ExtendedInfoSection.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default ExtendedInfoSection;
