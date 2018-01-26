import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';
import Pane from '@folio/stripes-components/lib/Pane';

const LocaleForm = (props) => {
  const {
    handleSubmit,
    pristine,
    submitting,
    label,
  } = props;

  const lastMenu = (<Button type="submit" buttonStyle="primary paneHeaderNewButton" disabled={(pristine || submitting)} marginBottom0>Save</Button>);

  return (
    <form id="locale-form" onSubmit={handleSubmit}>
      <Pane defaultWidth="fill" paneTitle={label} lastMenu={lastMenu}>
        <Row>
          <Col xs={12}>
            <Field
              component={Checkbox}
              id="profilePictures"
              name="profilePictures"
              label="Display profile pictures"
            />
          </Col>
        </Row>
      </Pane>
    </form>
  );
};

LocaleForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  label: PropTypes.string,
};

export default stripesForm({
  form: 'localeForm',
  navigationCheck: true,
  enableReinitialize: true,
})(LocaleForm);
