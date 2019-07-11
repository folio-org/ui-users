import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import { FormattedMessage } from 'react-intl';
import { Button, Col, Icon, Row, Select, TextField } from '@folio/stripes-components';
import css from './AddressEdit.css';
import { datas } from '../../../data/addressData';

const omitUsedOptions = (list, usedValues, key, id) => {
    const unUsedValues = cloneDeep(list);
    usedValues.forEach((item, i) => {
        if (id !== i) {
            const usedValueIndex = findIndex(unUsedValues, v => v.value === item[key]);
            if (usedValueIndex !== -1) {
                unUsedValues.splice(usedValueIndex, 1);
            }
        }
    });
    return unUsedValues;
};

class AddressSel extends React.Component {
    static propTypes = {
        addressFieldName: PropTypes.string,
        addressLabel: PropTypes.node,
        canDelete: PropTypes.bool,
        displayKey: PropTypes.bool,
        displayPrimary: PropTypes.bool,
        fieldComponents: PropTypes.object,
        fieldKey: PropTypes.number,
        handleDelete: PropTypes.func,
        headerFields: PropTypes.arrayOf(PropTypes.string),
        primary: PropTypes.func,
    }

    static contextTypes = {
        _reduxForm: PropTypes.object,
    }

    static defaultProps = {
        addressLabel: <FormattedMessage id="stripes-smart-components.address.addressLabel" />,
        fieldComponents: {
            addressType: Select,
        },
        headerFields: ['primaryAddress'],
        displayKey: true,
        displayPrimary: true,
    }

    constructor(props) {
        super(props);
        this.singlePrimary = this.singlePrimary.bind(this);
        this.state = {
            provinceList: datas,
            cityList: [],
            areaList: [],
            selectProvince: '',
            selectCity: '',
            selectArea: '',
        };
        this.handleChangeProvince = this.handleChangeProvince.bind(this);
        this.handleChangeCity = this.handleChangeCity.bind(this);
        this.handleChangeArea = this.handleChangeArea.bind(this);
    }

    singlePrimary(id) {
        const { values, dispatch, change } = this.context._reduxForm;
        values.personal.addresses.forEach((a, i) => {
            if (i === id) {
                dispatch(change(`personal.addresses[${i}].primaryAddress`, true));
                dispatch(change(`personal.addresses[${i}].primary`, true));
            } else {
                dispatch(change(`personal.addresses[${i}].primaryAddress`, false));
                dispatch(change(`personal.addresses[${i}].primary`, false));
            }
        });
    }

    handleChangeProvince(e){
        let cityList = []
        let areaList = []

        datas.map((item) => {
            if (e.target.value == item.name) {
                cityList = item.cityList
            }
        })

        this.setState({
            selectProvince: e.target.value,
            selectCity: '',
            selectArea: '',
            cityList: cityList,
            areaList: areaList,
        })
    }

    handleChangeCity(e){
        const cityList = this.state.cityList
        let areas = []

        cityList.map((item) => {
            if (e.target.value == item.name) {
                areas = item.areaList
            }
        })

        this.setState({
            selectCity: e.target.value,
            selectArea: '',
            areaList: areas,
        })
    }

    handleChangeArea(e){
        this.setState({
            selectArea: e.target.value,
        })
    }

    render() {
        const {
            addressFieldName,
            addressLabel,
            fieldKey,
            canDelete,
            fieldComponents,
            displayKey,
            displayPrimary,
        } = this.props;

        const {
            selectProvince,
            selectCity,
            selectArea,
            provinceList,
            cityList, 
            areaList,
        } = this.state;

        const {
            values,
        } = this.context._reduxForm;

        const PrimaryRadio = ({ input, ...props }) => (
            <label className={css.primaryToggle} htmlFor={props.id}>
                <input
                    type="radio"
                    checked={input.value}
                    id={props.id}
                    onChange={() => { this.singlePrimary(fieldKey); }}
                    name="primary"
                    aria-labelledby={`Use address ${fieldKey + 1} as primary address`}
                />
                Use as primary address
            </label>
        );

        const mergedFieldComponents = Object.assign(AddressSel.defaultProps.fieldComponents, fieldComponents);

        const list = omitUsedOptions(
            mergedFieldComponents['addressType'].props.dataOptions,
            values.personal.addresses,
            'addressType',
            fieldKey,
        );

        const provinces = provinceList.map(i => (
            { value: i.name, label: i.name }
          ));

        const cities = (cityList || {}).map(i => (
            { value: i.name, label: i.name }
          ));

        const areas = (areaList || {}).map(i => (
            { value: i, label: i }
          ));

        return (
            <div className={css.addressForm}>
                <div className={css.addressFormHeader} start="xs">
                    <div className={css.addressLabel}>
                        {addressLabel}
                        {displayKey && (this.props.fieldKey + 1)}
                    </div>
                    <div>
                        {displayPrimary &&
                            <Field
                                component={PrimaryRadio}
                                name={`${addressFieldName}.primary`}
                                id={`PrimaryAddress---${addressFieldName}`}
                                fieldKey={this.props.fieldKey}
                            />
                        }
                    </div>
                    <div className={css.addressHeaderActions}>
                        {
                            canDelete &&
                            <Button
                                buttonStyle="link slim"
                                style={{ margin: 0, padding: 0 }}
                                onClick={() => { this.props.handleDelete(fieldKey); }}
                            >
                                <Icon icon="trash" width="24px" height="24px" />
                                <span className="sr-only">
                                    Remove Address
                                    {this.props.fieldKey + 1}
                                </span>
                            </Button>
                        }
                    </div>
                </div>
                <div className={css.addressFormBody}>
                    <Row key={fieldKey}>
                        <Col xs={12} md={3}>
                            <Field
                                label={<FormattedMessage id="ui-users.contact.addressType" />}
                                name={`${addressFieldName}.addressType`}
                                component={Select}
                                dataOptions={list}
                            />
                        </Col>
                        <Col xs={12} md={3}>
                            <Field
                                label="State/Prov/Region"
                                name={`${addressFieldName}.stateRegion`}
                                value={selectProvince}
                                component={Select}
                                dataOptions={[{label:'Select region', value:''}, ...provinces]}
                                onChange={this.handleChangeProvince}
                            />
                        </Col>
                        <Col xs={12} md={3}>
                            <Field 
                                label="City"
                                name={`${addressFieldName}.city`}
                                value={selectCity}
                                component={Select}
                                dataOptions={[{label:'Select city', value:''}, ...cities]}
                                onChange={this.handleChangeCity}
                            />
                        </Col>
                        <Col xs={12} md={3}>
                            <Field 
                                label="Zip/Postal Code"
                                name={`${addressFieldName}.zipCode`}
                                value={selectArea}
                                component={Select}
                                dataOptions={[{label:'Select postal code', value:''}, ...areas]}
                                onChange={this.handleChangeArea}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default AddressSel;