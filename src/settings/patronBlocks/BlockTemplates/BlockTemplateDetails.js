import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Col,
  ExpandAllButton,
  Headline,
  Icon,
  KeyValue,
  NoValue,
  Row,
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

function BlockTemplateDetails(props) {
  const [sections, setSections] = useState({
    templateInformation: true,
    blockInformation: true,
  });

  const { initialValues } = props;
  const { blockTemplate } = initialValues;

  const handleSectionToggle = ({ id }) => {
    const newSections = _.cloneDeep(sections);
    newSections[id] = !newSections[id];
    setSections(newSections);
  };

  const renderBlockActions = () => {
    return (
      <>
        <div>
          <Icon id="block-template-borrowing" icon={blockTemplate?.borrowing ? 'select-all' : 'deselect-all'}>
            <FormattedMessage id="ui-users.blocks.columns.borrowing" />
          </Icon>
        </div>
        <div>
          <Icon id="block-template-renewals" icon={blockTemplate?.renewals ? 'select-all' : 'deselect-all'}>
            <FormattedMessage id="ui-users.blocks.columns.renewals" />
          </Icon>
        </div>
        <div>
          <Icon id="block-template-requests" icon={blockTemplate?.requests ? 'select-all' : 'deselect-all'}>
            <FormattedMessage id="ui-users.blocks.columns.requests" />
          </Icon>
        </div>
      </>
    );
  };

  return (
    <div data-test-block-template-details>
      <Row end="xs">
        <Col xs>
          <ExpandAllButton accordionStatus={sections} onToggle={setSections} />
        </Col>
      </Row>
      <Accordion
        open={sections.templateInformation}
        id="templateInformation"
        onToggle={handleSectionToggle}
        label={
          <Headline size="large" tag="h3">
            <FormattedMessage id="ui-users.manualBlockTemplates.templateInformation" />
          </Headline>
        }
      >
        {initialValues?.metadata?.createdDate && (
          <Row>
            <Col xs={12}>
              <ViewMetaData metadata={initialValues.metadata} />
            </Col>
          </Row>
        )}
        <Row>
          <Col xs={6}>
            <KeyValue
              label={
                <FormattedMessage id="ui-users.manualBlockTemplates.templateName" />
              }
              value={_.get(initialValues, ['name'], <NoValue />)}
            />
          </Col>
          <Col xs={6}>
            <KeyValue
              label={
                <FormattedMessage id="ui-users.manualBlockTemplates.blockCode" />
              }
              value={_.get(initialValues, ['code'], <NoValue />)}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue
              label={<FormattedMessage id="ui-users.description" />}
              value={_.get(initialValues, ['desc'], <NoValue />)}
            />
          </Col>
        </Row>
      </Accordion>
      <Accordion
        open={sections.blockInformation}
        id="blockInformation"
        onToggle={handleSectionToggle}
        label={
          <Headline size="large" tag="h3">
            <FormattedMessage id="ui-users.manualBlockTemplates.blockInformation" />
          </Headline>
        }
      >
        <Row>
          <Col xs={12}>
            <KeyValue
              label={<FormattedMessage id="ui-users.blocks.columns.desc" />}
              value={_.get(blockTemplate, ['desc'], <NoValue />)}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue
              label={<FormattedMessage id="ui-users.blocks.form.label.staff" />}
              value={<NoValue />}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue
              label={
                <FormattedMessage id="ui-users.blocks.form.label.message" />
              }
              value={_.get(blockTemplate, ['patronMessage'], <NoValue />)}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue
              label={
                <FormattedMessage id="ui-users.information.expirationDate" />
              }
              value={<NoValue />}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue
              label={
                <FormattedMessage id="ui-users.manualBlockTemplates.blockActions" />
              }
              value={renderBlockActions()}
            />
          </Col>
        </Row>
      </Accordion>
    </div>
  );
}

BlockTemplateDetails.propTypes = {
  initialValues: PropTypes.object,
};

export default BlockTemplateDetails;
