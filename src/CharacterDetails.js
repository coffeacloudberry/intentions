import React from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Form, Select, Input, Radio, Row, Col, Rate } from "antd";
const { Option } = Select;

/**
 * Dropdown selection of the sex.
 * @param props The callback function.
 * @returns {JSX.Element}
 * @constructor
 */
const Sex = (props) => {
    const { handleSex } = props;

    return (
        <Form.Item label={<FormattedMessage id="sexLabel" />}>
            <Select style={{ width: 110 }} onChange={handleSex}>
                <Option value="female">
                    <FormattedMessage id="female" />
                </Option>
                <Option value="male">
                    <FormattedMessage id="male" />
                </Option>
            </Select>
        </Form.Item>
    );
};

/**
 * The "level" component, stars-style, with tooltips and a dynamic description of the current seletion.
 * It is possible to select no level (undefined).
 * @param props Current level and callback function.
 * @returns {JSX.Element}
 * @constructor
 */
const Level = (props) => {
    const { handleLevel, level } = props;
    let tooltips = [];

    for (let i = 1; i <= 5; i++) {
        tooltips.push(<FormattedMessage id={`level${i}`} />);
    }

    return (
        <Form.Item
            label={<FormattedMessage id="levelLabel" />}
            extra={<FormattedMessage id="levelExtra" />}
        >
            <Rate tooltips={tooltips} onChange={handleLevel} value={level} />
            {level ? (
                <span className="ant-rate-text">
                    {<FormattedMessage id={`level${level}`} />}
                </span>
            ) : (
                ""
            )}
        </Form.Item>
    );
};

/**
 * The phone number component is an imput.
 * TODO: one improvement would be to handle int'l phone extension.
 * @param props Callback function.
 * @returns {JSX.Element}
 * @constructor
 */
const PhoneNumber = (props) => {
    const { handlePhoneNumber } = props;

    return (
        <Form.Item
            label={<FormattedMessage id="phoneNumberLabel" />}
            extra={<FormattedMessage id="phoneNumberExtra" />}
        >
            <Input onChange={handlePhoneNumber} />
        </Form.Item>
    );
};

/**
 * Component containing two inputs: first name and family name.
 * TODO: one improvement would be to make the family name a selectable input based on other members name.
 * @param props Callback function.
 * @returns {JSX.Element}
 * @constructor
 */
const Name = (props) => {
    const { handleFirstName, handleFamilyName } = props;
    const { formatMessage } = useIntl();

    return (
        <Form.Item label={<FormattedMessage id="nameLabel" />}>
            <Input
                placeholder={formatMessage({ id: "firstName" })}
                style={{ display: "inline-block", width: "calc(50% - 6px)" }}
                onChange={handleFirstName}
            />
            <span style={{ display: "inline-block", width: "12px" }}></span>
            <Input
                placeholder={formatMessage({ id: "familyName" })}
                style={{ display: "inline-block", width: "calc(50% - 6px)" }}
                onChange={handleFamilyName}
            />
        </Form.Item>
    );
};

/**
 * Input component with label and description dynamically updated.
 * @param props Callback function and variables to choose the label and description.
 * @returns {JSX.Element}
 * @constructor
 */
const Description = (props) => {
    const { isLeader, sex, handleDescription } = props;
    let messageId;

    if (isLeader) {
        messageId = "describeYourself";
    } else if (sex === "female") {
        messageId = "describeHer";
    } else if (sex === "male") {
        messageId = "describeHim";
    } else {
        messageId = "describeHimHer";
    }

    return (
        <Form.Item
            label={<FormattedMessage id={`${messageId}Label`} />}
            extra={<FormattedMessage id={`${messageId}Extra`} />}
        >
            <Input onChange={handleDescription} />
        </Form.Item>
    );
};

/**
 * Input component.
 * @param props Callback function.
 * @returns {JSX.Element}
 * @constructor
 */
const Identity = (props) => {
    const { handleIdentity } = props;

    return (
        <Form.Item
            label={<FormattedMessage id="identityLabel" />}
            extra={<FormattedMessage id="identityExtra" />}
        >
            <Input onChange={handleIdentity} />
        </Form.Item>
    );
};

/**
 * Component containing a radio (healthy or not). If "not healthy", an required input is displayed.
 * @param props Callback function and current status and member ID.
 * @returns {JSX.Element}
 * @constructor
 */
const MedicalConditions = (props) => {
    const { memberId, isHealthy, healthDetails } = props;

    const onChangeMedicalConditionsState = (event) => {
        props.handleConditions(event.target.value, healthDetails);
    };

    const onChangeDetails = (event) => {
        props.handleConditions(false, event.target.value);
    };

    return (
        <>
            <Form.Item>
                <Radio.Group
                    value={isHealthy}
                    onChange={onChangeMedicalConditionsState}
                >
                    <Radio value={true}>
                        <FormattedMessage id="medicalConditionsOk" />
                    </Radio>
                    <Radio value={false}>
                        <FormattedMessage id="medicalConditionsKo" />
                    </Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item
                label={<FormattedMessage id="medicalConditionsLabel" />}
                extra={<FormattedMessage id="medicalConditionsExtra" />}
                style={isHealthy ? { display: "none" } : {}}
                name={`medicalConditions${memberId}`}
                rules={[
                    {
                        required: !isHealthy,
                        message: (
                            <FormattedMessage id="medicalConditionsNotice" />
                        ),
                    },
                ]}
            >
                <Input onChange={onChangeDetails} />
            </Form.Item>
        </>
    );
};

/**
 * All components specific to one member.
 * @param props Current status and member data (current one only) that would be updated.
 * @returns {JSX.Element}
 * @constructor
 */
const CharacterDetails = (props) => {
    const { isLeader, memberId } = props;
    const { sex, isHealthy, healthDetails, level } = props.memberData;

    const handleSex = (sex) => {
        props.handleMember({ ...props.memberData, sex: sex });
    };

    const handleFirstName = (event) => {
        props.handleMember({
            ...props.memberData,
            firstName: event.target.value,
        });
    };

    const handleFamilyName = (event) => {
        props.handleMember({
            ...props.memberData,
            familyName: event.target.value,
        });
    };

    const handlePhoneNumber = (event) => {
        props.handleMember({
            ...props.memberData,
            phoneNumber: event.target.value,
        });
    };

    const handleLevel = (newLevel) => {
        props.handleMember({ ...props.memberData, level: newLevel });
    };

    const handleDescription = (event) => {
        props.handleMember({
            ...props.memberData,
            description: event.target.value,
        });
    };

    const handleConditions = (newIsHealthy, newHealthDetails) => {
        props.handleMember({
            ...props.memberData,
            isHealthy: newIsHealthy,
            healthDetails: newHealthDetails,
        });
    };

    const handleIdentity = (event) => {
        props.handleMember({
            ...props.memberData,
            identity: event.target.value,
        });
    };

    return (
        <>
            <Row gutter={12}>
                <Col xs={{ span: 24 }} md={{ span: 6, push: 18 }}>
                    <Sex handleSex={handleSex} />
                </Col>
                <Col xs={{ span: 24 }} md={{ span: 18, pull: 6 }}>
                    <Name
                        handleFirstName={handleFirstName}
                        handleFamilyName={handleFamilyName}
                    />
                </Col>
            </Row>
            <Row gutter={12}>
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                    <PhoneNumber handlePhoneNumber={handlePhoneNumber} />
                </Col>
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                    <Level handleLevel={handleLevel} level={level} />
                </Col>
            </Row>
            <Description
                isLeader={isLeader}
                sex={sex}
                handleDescription={handleDescription}
            />
            <Identity handleIdentity={handleIdentity} />
            <MedicalConditions
                isLeader={isLeader}
                sex={sex}
                handleConditions={handleConditions}
                memberId={memberId}
                isHealthy={isHealthy ?? true}
                healthDetails={healthDetails}
            />
        </>
    );
};

export default CharacterDetails;
