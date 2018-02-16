import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Button from '@folio/stripes-components/lib/Button';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';
import { Field } from 'redux-form';

import css from './EditExtendedInfo.css';

class EditExtendedInfo extends React.Component {
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
        label="Extended information"
      >
        <Row>
          <Col xs={8}>
            <Row>
              <Col xs={3}>
                <Field
                  component={Datepicker}
                  label="Date enrolled"
                  dateFormat="YYYY-MM-DD"
                  name="enrollmentDate"
                  id="adduser_enrollmentdate"
                />
              </Col>
              <Col xs={3}>
                <Field
                  label="External system ID"
                  name="externalSystemId"
                  id="adduser_externalsystemid"
                  component={TextField}
                  fullWidth
                />
              </Col>
              <Col xs={3}>
                <Field
                  component={Datepicker}
                  label="Birth date"
                  dateFormat="YYYY-MM-DD"
                  name="personal.dateOfBirth"
                  id="adduser_dateofbirth"
                  backendDateStandard="YYYY-MM-DD"
                />
              </Col>
              <Col xs={3}>
                <p className={css.label}>FOLIO number</p>
                <p>{initialValues.id || '-'}</p>
              </Col>
            </Row>
            {!initialValues.id &&
              <Row>
                <Col xs={4}>
                  <Field label="FOLIO Password *" name="creds.password" id="pw" autoComplete="new-password" type={this.state.showPassword ? 'text' : 'password'} component={TextField} required fullWidth />
                </Col>
                <Col xs={1}>
                  <div className={css.togglePw}>
                    <Button id="toggle_pw_btn" onClick={() => this.togglePassword()}>
                      {this.state.showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </Col>
              </Row>
            }
          </Col>
        </Row>
        <br />
      </Accordion>
    );
  }
}

EditExtendedInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default EditExtendedInfo;
