import React, { Component } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
    Form,
    Divider,
    DatePicker,
    Select,
    Input,
    List,
    Button,
    Modal,
    Typography,
    Popconfirm,
    Spin,
    Space,
} from "antd";
import {
    FilePdfOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
} from "@ant-design/icons";
import CharacterDetails from "./CharacterDetails";
import pdfGenerator from "./pdfGenerator";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

/**
 * List of members except the team leader.
 * @param props Callback function and members data except the team leader (first element).
 * @returns {JSX.Element}
 * @constructor
 */
const OtherTeamMembers = (props) => {
    const rows = props.membersData.map((memberData, index) => {
        const memberId = index + 1;
        return (
            <div key={`teamMember${memberId}`}>
                <Divider>
                    <FormattedMessage id="member" />
                </Divider>
                <CharacterDetails
                    isLeader={false}
                    memberData={memberData}
                    handleMember={props.handleMember(memberId)}
                    memberId={memberId}
                />
            </div>
        );
    });

    return <>{rows}</>;
};

/**
 * List all members (singleton or team).
 * @param props Callback function and members data (all members, one element if singleton).
 * @returns {JSX.Element}
 * @constructor
 */
const AllCharacterDetails = (props) => {
    const { membersData, handleMember } = props;

    if (membersData.length > 1) {
        const [, ...otherTeamMembers] = membersData; // exclude the team leader
        return (
            <>
                <Divider>
                    <Title level={4}>
                        <FormattedMessage id="aboutYou" /> (
                        <FormattedMessage id="teamLeader" />)
                    </Title>
                </Divider>
                <CharacterDetails
                    isLeader={true}
                    memberData={membersData[0]}
                    handleMember={handleMember(0)}
                    memberId={0}
                />
                <Divider>
                    <Title level={4}>
                        <FormattedMessage id="aboutYourTeamMembers" />
                    </Title>
                </Divider>
                <OtherTeamMembers
                    membersData={otherTeamMembers}
                    handleMember={handleMember}
                />
            </>
        );
    } else {
        return (
            <>
                <Divider>
                    <Title level={4}>
                        <FormattedMessage id="aboutYou" />
                    </Title>
                </Divider>
                <CharacterDetails
                    isLeader={true}
                    memberData={membersData[0]}
                    handleMember={handleMember(0)}
                    memberId={0}
                />
            </>
        );
    }
};

/**
 * Select a date/time range.
 * @returns {JSX.Element}
 * @constructor
 */
const TimeRange = () => {
    return (
        <Form.Item
            label={<FormattedMessage id="timeRangePickerLabel" />}
            name="timeRange"
        >
            <RangePicker
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
            />
        </Form.Item>
    );
};

/**
 * Select the activity.
 * TODO: Update other components (such as the essential gear list) based on the selected activity.
 * @returns {JSX.Element}
 * @constructor
 */
const Activity = () => {
    const { formatMessage } = useIntl();

    return (
        <Form.Item
            label={<FormattedMessage id="activityLabel" />}
            name="activity"
        >
            <Select style={{ width: 120 }}>
                <Option value={formatMessage({ id: "hiking" })}>
                    <FormattedMessage id="hiking" />
                </Option>
                <Option value={formatMessage({ id: "skiing" })}>
                    <FormattedMessage id="skiing" />
                </Option>
                <Option value={formatMessage({ id: "climbing" })}>
                    <FormattedMessage id="climbing" />
                </Option>
            </Select>
        </Form.Item>
    );
};

/**
 * Some textareas for the trip details. Textareas are automatically resized.
 * @returns {JSX.Element}
 * @constructor
 */
const TripDetails = () => {
    return (
        <>
            <Form.Item
                label={<FormattedMessage id="tripIntentionsDetailsLabel" />}
                extra={<FormattedMessage id="tripIntentionsDetailsExtra" />}
                name="tripIntentionsDetails"
            >
                <TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
            </Form.Item>
            <Form.Item
                label={<FormattedMessage id="prePostTripIntentionsLabel" />}
                extra={<FormattedMessage id="prePostTripIntentionsExtra" />}
                name="prePostTripIntentions"
            >
                <TextArea autoSize={{ maxRows: 8 }} />
            </Form.Item>
            <Form.Item
                label={<FormattedMessage id="postTripIntentionsDetailsLabel" />}
                extra={<FormattedMessage id="postTripIntentionsDetailsExtra" />}
                name="postTripIntentionsDetails"
            >
                <TextArea autoSize={{ maxRows: 8 }} />
            </Form.Item>
        </>
    );
};

/**
 * Essential gear list with the possibility of adding custom gear not in the dropdown list.
 * A State Hook is used to use useIntl() and handle changes inside the component.
 * @returns {JSX.Element}
 * @constructor
 */
const GearList = () => {
    const [selectedItems, setSelectedItems] = React.useState([]); // nothing selected
    const [hasSatPhone, setHasSatPhone] = React.useState(false); // no phone
    const { formatMessage } = useIntl();
    const optionsGear = [];
    const satPhone = formatMessage({ id: "gear9" });
    const totalItems = 14;
    const availableWarnings = [1, 7, 13];

    React.useEffect(() => {
        setHasSatPhone(selectedItems.indexOf(satPhone) !== -1);
    }, [selectedItems, satPhone]); // re-run the effect only if updating the list

    for (let i = 1; i <= totalItems; i++) {
        const itemId = `gear${i}`;
        optionsGear.push(
            <Option key={itemId} value={formatMessage({ id: itemId })}>
                <FormattedMessage id={itemId} />
            </Option>
        );
    }

    /**
     * When the user remove an item without using the dropdown list, update the list.
     * @param deselectedItem Just the deleted items.
     */
    const handleDeselect = (deselectedItem) => {
        setSelectedItems(
            selectedItems.filter((value) => {
                return value !== deselectedItem;
            })
        );
    };

    /**
     * Keep track of the selected items.
     * @param newSelectedItems List of selected items.
     */
    const handleChange = (newSelectedItems) => {
        setSelectedItems(newSelectedItems);
    };

    /**
     * When the user leaves the dropdown menu. The blur event does not have the
     * list of selected items, that is why the onChange event is used.
     */
    const handleBlur = () => {
        let warnings = [];

        selectedItems.forEach((item) => {
            availableWarnings.some((idx) => {
                // find key from value
                const itemId = `gear${idx}`;
                const title = formatMessage({ id: itemId });
                const desc = formatMessage({ id: itemId + "warning" });

                if (title === item) {
                    warnings.push({
                        title: title,
                        description: desc,
                    });
                    return true; // stop looping over warnings
                }
                return false;
            });
        });

        if (warnings.length) {
            // specific information displayed in a modal
            Modal.info({
                title: formatMessage({ id: "gearWarning" }),
                width: 800,
                content: (
                    <List
                        itemLayout="horizontal"
                        bordered={true}
                        dataSource={warnings}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.title}
                                    description={item.description}
                                />
                            </List.Item>
                        )}
                    ></List>
                ),
            });
        }
    };

    return (
        <>
            <Form.Item
                label={<FormattedMessage id="essentialGearLabel" />}
                extra={<FormattedMessage id="essentialGearExtra" />}
                name="essentialGear"
            >
                <Select
                    mode="tags"
                    placeholder={<FormattedMessage id="goingNude" />}
                    onChange={handleChange}
                    onDeselect={handleDeselect}
                    onBlur={handleBlur}
                >
                    {optionsGear}
                </Select>
            </Form.Item>
            <Form.Item
                label={<FormattedMessage id="satPhoneNumberLabel" />}
                style={hasSatPhone ? {} : { display: "none" }}
                name="satPhoneNumber"
                rules={[
                    {
                        required: hasSatPhone,
                        message: <FormattedMessage id="satPhoneNumberNotice" />,
                    },
                ]}
            >
                <Input />
            </Form.Item>
        </>
    );
};

/**
 * Buttons for adding/removing a member. A popup is displayed on remove because it cannot be undone.
 * @param props Current state and callback function.
 * @returns {JSX.Element}
 * @constructor
 */
const AddRemoveMemberButtons = (props) => {
    const [visible, setVisible] = React.useState(false);
    const { members, addMember, removeMember } = props;
    const isAlone = members.length < 2;

    const showPopConfirm = () => {
        setVisible(true);
    };
    const handleConfirm = () => {
        setVisible(false);
        removeMember();
    };
    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <Form.Item style={{ textAlign: "center" }}>
            <Space>
                <Button
                    icon={<UserAddOutlined />}
                    htmlType="button"
                    onClick={addMember}
                >
                    <FormattedMessage id="addMember" />
                </Button>
                {isAlone ? null : (
                    <Popconfirm
                        title={<FormattedMessage id="popConfirmRemoveMember" />}
                        okText={<FormattedMessage id="popConfirmOkText" />}
                        onConfirm={handleConfirm}
                        cancelText={
                            <FormattedMessage id="popConfirmCancelText" />
                        }
                        onCancel={handleCancel}
                        visible={visible}
                        mouseLeaveDelay={0}
                    >
                        <Button
                            icon={<UserDeleteOutlined />}
                            htmlType="button"
                            onClick={showPopConfirm}
                        >
                            <FormattedMessage id="removeMember" />
                        </Button>
                    </Popconfirm>
                )}
            </Space>
        </Form.Item>
    );
};

/**
 * Entire form with all inputs required to generate the PDF.
 */
class IntentionsForm extends Component {
    /**
     * Start with a singleton.
     * @type {{members: [{}]}}
     */
    state = {
        members: [{}],
        staticFormValues: null,
        inProgress: false,
    };

    /**
     * Create a new PDF instance and generate the PDF.
     * @param data Members data and trip details.
     */
    newDoc = (data) => {
        // font styles are: normal, bold, italic, bolditalic
        this.doc = new pdfGenerator(
            [
                {
                    path: "fonts/life_savers/LifeSavers_Regular.ttf",
                    name: "myTitle",
                    style: "normal",
                },
                {
                    path: "fonts/life_savers/LifeSavers_Bold.ttf",
                    name: "myTitle",
                    style: "bold",
                },
                {
                    path: "fonts/andika_basic/AndikaNewBasic_R.ttf",
                    name: "myText",
                    style: "normal",
                },
                {
                    path: "fonts/andika_basic/AndikaNewBasic_B.ttf",
                    name: "myText",
                    style: "bold",
                },
                {
                    path: "fonts/andika_basic/AndikaNewBasic_I.ttf",
                    name: "myText",
                    style: "italic",
                },
            ],
            data,
            this.props.locale,
            this.props.lang,
            this.handlePdfCreationSuccess
        );
    };

    /**
     * Callback when the PDF has been generated and ready to be downloaded.
     */
    handlePdfCreationSuccess = () => {
        this.setState({ ...this.state, inProgress: false });
        this.props.handleSuccess();
    };

    /**
     * Add one empty member to the list of members.
     */
    addMember = () => {
        let newMembers = [...this.state.members, {}];
        this.setState({ ...this.state, members: newMembers });
        this.updateProgressCounter(this.state.staticFormValues, newMembers);
    };

    /**
     * Remove the last member.
     */
    removeMember = () => {
        let members = this.state.members;
        members.pop();
        this.setState({ ...this.state, members: members });
        this.updateProgressCounter(this.state.staticFormValues, members);
    };

    /**
     * Update the state of one member.
     * @param idx Member ID.
     * @returns {function(*): void} Handler for the identified member.
     */
    handleMember = (idx) => (newMemberData) => {
        const newMembers = this.state.members.map((member, map_idx) => {
            return idx === map_idx ? newMemberData : member;
        });

        this.setState({ ...this.state, members: newMembers });
        this.updateProgressCounter(this.state.staticFormValues, newMembers);
    };

    /**
     * Update the counter highlighting how much the user has filled in the form.
     * The idea is to motivate the user to share as much information as possible.
     * The counter is a percentage - 0%: empty form, 100%: fulfilled.
     * @param staticFormValues General trip information. 60% max.
     * @param members Information specific to members. It has to be an array. 40% max shared.
     */
    updateProgressCounter = (staticFormValues, members) => {
        let currCounter = 0,
            totalMembers = members.length;

        if (staticFormValues !== null) {
            if (staticFormValues.timeRange) {
                currCounter += 10;
            }
            if (staticFormValues.activity) {
                currCounter += 5;
            }
            if (staticFormValues.essentialGear) {
                currCounter += 10;
            }
            if (staticFormValues.postTripIntentionsDetails) {
                currCounter += 10;
            }
            if (staticFormValues.prePostTripIntentions) {
                currCounter += 5;
            }
            if (staticFormValues.tripIntentionsDetails) {
                currCounter += 20;
            }
        }

        members.forEach((member) => {
            if (member.firstName && member.familyName) {
                currCounter += 10 / totalMembers;
            }
            if (member.description) {
                currCounter += 10 / totalMembers;
            }
            if (member.phoneNumber) {
                currCounter += 10 / totalMembers;
            }
            if (member.identity) {
                currCounter += 5 / totalMembers;
            }
            if (member.sex) {
                currCounter += 3 / totalMembers;
            }
            if (member.level) {
                currCounter += 2 / totalMembers;
            }
        });
        this.props.handleProgress(currCounter);
    };

    /**
     * When the general information - static form - is updated.
     * @param changedValues Not used.
     * @param allValues All static fields.
     */
    onValuesChange = (changedValues, allValues) => {
        this.setState({ ...this.state, staticFormValues: allValues });
        this.updateProgressCounter(allValues, this.state.members);
    };

    /**
     * When the user submit the intentions form: generate the PDF.
     * @param values All data (static fields and members data.)
     */
    onFinish = (values) => {
        this.setState({ ...this.state, inProgress: true });
        this.newDoc({ ...values, members: this.state.members });
    };

    render() {
        return (
            <Form
                layout="vertical"
                className="intentionsForm"
                onFinish={this.onFinish}
                onValuesChange={this.onValuesChange}
            >
                <Divider>
                    <Title level={4}>
                        <FormattedMessage id="aboutYourTrip" />
                    </Title>
                </Divider>
                <TimeRange />
                <Activity />
                <TripDetails />
                <AllCharacterDetails
                    membersData={this.state.members}
                    handleMember={this.handleMember}
                />
                <Divider />
                <AddRemoveMemberButtons
                    members={this.state.members}
                    addMember={this.addMember}
                    removeMember={this.removeMember}
                />
                <Divider>
                    <Title level={4}>
                        <FormattedMessage id="equipment" />
                    </Title>
                </Divider>
                <GearList />
                <Divider />
                <Form.Item style={{ textAlign: "center" }}>
                    {this.state.inProgress ? (
                        <Button type="primary" htmlType="submit" disabled>
                            <Spin size="small" style={{ marginRight: 4 }} />
                            <FormattedMessage id="generatePDF" />
                        </Button>
                    ) : (
                        <Button type="primary" htmlType="submit">
                            <FilePdfOutlined style={{ marginRight: 4 }} />
                            <FormattedMessage id="generatePDF" />
                        </Button>
                    )}
                </Form.Item>
            </Form>
        );
    }
}

export default IntentionsForm;
