import React, { Component } from "react";
import {
    Layout,
    Menu,
    BackTop,
    ConfigProvider,
    Modal,
    Typography,
    Progress,
    Button,
} from "antd";
import {
    TranslationOutlined,
    QuestionOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import { IntlProvider, FormattedMessage } from "react-intl";
import CopyrightNotice from "./CopyrightNotice";
import About from "./About";
import PdfCreationOnSuccess from "./PdfCreationOnSuccess";
import IntentionsForm from "./IntentionsForm";
import enGB from "antd/lib/locale/en_GB";
import "moment/locale/en-gb";
import frFR from "antd/lib/locale/fr_FR";
import "moment/locale/fr";
import moment from "moment";
import "antd/dist/antd.css";
const { Footer, Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Title } = Typography;

// moment is required for full translations in antd components
moment.locale("en-gb");

/**
 * The entire application.
 */
class App extends Component {
    /**
     * Load translations from JSON files.
     */
    translations = {
        en: require("./lang/en.json"),
        fr: require("./lang/fr.json"),
    };

    /**
     * Default state of the application. Default language is English.
     */
    state = {
        currentLocale: "en",
        currentAntLocale: enGB,
        visibleAbout: false,
        visibleSupport: false,
        visiblePdfCreationOnSuccess: false,
        progressCounter: 0,
    };

    /**
     * Return the antd locale data.
     * @param newLocale The language to select ("en" or "fr").
     * @returns {Locale} The antd locale data.
     */
    getAntLocale = (newLocale) => {
        switch (newLocale) {
            case "fr":
                return frFR;
            default:
                return enGB;
        }
    };

    /**
     * Change the application locale.
     * @param event Contains the language to choose.
     */
    handleLanguage = (event) => {
        const newLocale = event.key;

        this.setState({
            ...this.state,
            currentLocale: newLocale,
            currentAntLocale: this.getAntLocale(newLocale),
            progressCounter: 0,
        });

        switch (newLocale) {
            case "fr":
                moment.locale("fr");
                break;
            default:
                moment.locale("en-gb");
        }
    };

    /**
     * When the "About" modal is closed.
     */
    onCloseAbout = () => {
        this.setState({
            ...this.state,
            visibleAbout: false,
        });
    };

    /**
     * Close the modal used as feedback of a successful PDF creation.
     */
    onClosePdfCreationOnSuccess = () => {
        this.setState({
            ...this.state,
            visiblePdfCreationOnSuccess: false,
        });
    };

    /**
     * Show the "About" modal.
     */
    showAbout = () => {
        this.setState({
            ...this.state,
            visibleAbout: true,
        });
    };

    /**
     * When the "Support" modal is closed.
     */
    handleCancelSupport = () => {
        this.setState({
            ...this.state,
            visibleSupport: false,
        });
    };

    /**
     * Show the "Support" modal.
     */
    showSupport = () => {
        this.setState({
            ...this.state,
            visibleSupport: true,
        });
    };

    /**
     * Update the counter used to highlight how much the form is filled in.
     * @param progress Percentage.
     */
    handleProgress = (progress) => {
        this.setState({
            ...this.state,
            progressCounter: progress,
        });
    };

    /**
     * Show the modal used as feedback of a successful PDF creation.
     */
    handleSuccess = () => {
        this.setState({
            ...this.state,
            visiblePdfCreationOnSuccess: true,
        });
    };

    render() {
        const {
            currentLocale,
            currentAntLocale,
            visibleAbout,
            visibleSupport,
            progressCounter,
            visiblePdfCreationOnSuccess,
        } = this.state;

        return (
            <IntlProvider
                messages={this.translations[currentLocale]}
                locale={currentLocale}
                defaultLocale="en"
            >
                <ConfigProvider locale={currentAntLocale}>
                    <Modal
                        title={<FormattedMessage id="about" />}
                        visible={visibleAbout}
                        className="modalAbout"
                        onCancel={this.onCloseAbout}
                        footer={<CopyrightNotice />}
                    >
                        <About />
                    </Modal>
                    <Modal
                        title={<FormattedMessage id="onPdfSuccessTitle" />}
                        width={600}
                        visible={visiblePdfCreationOnSuccess}
                        onCancel={this.onClosePdfCreationOnSuccess}
                        footer={
                            <Button
                                type="primary"
                                onClick={this.onClosePdfCreationOnSuccess}
                            >
                                OK
                            </Button>
                        }
                    >
                        <PdfCreationOnSuccess />
                    </Modal>
                    <Modal
                        title={<FormattedMessage id="aboutSupportTitle" />}
                        visible={visibleSupport}
                        onCancel={this.handleCancelSupport}
                        cancelText={<FormattedMessage id="close" />}
                        okText={
                            <a href="https://ko-fi.com/explorewilder">
                                <FormattedMessage id="buyMeACoffee" />
                            </a>
                        }
                    >
                        <p
                            dangerouslySetInnerHTML={{
                                __html: this.translations[currentLocale][
                                    "aboutSupportDesc"
                                ],
                            }}
                        ></p>
                    </Modal>
                    <BackTop />
                    <Layout>
                        <Sider className="largeScreenSizeMenu">
                            <Menu
                                mode="inline"
                                theme="dark"
                                selectedKeys={[currentLocale]}
                            >
                                <SubMenu
                                    key="sub1"
                                    icon={<TranslationOutlined />}
                                    title={<FormattedMessage id="language" />}
                                    onClick={this.handleLanguage}
                                    style={{ width: 200 }}
                                >
                                    <Menu.Item key="en">English</Menu.Item>
                                    <Menu.Item key="fr">Français</Menu.Item>
                                </SubMenu>
                                <Menu.Item
                                    key="about"
                                    icon={<QuestionOutlined />}
                                    onClick={this.showAbout}
                                >
                                    <FormattedMessage id="about" />
                                </Menu.Item>
                                <Menu.Item
                                    key="support"
                                    icon={<HeartOutlined />}
                                    onClick={this.showSupport}
                                >
                                    <FormattedMessage id="support" />
                                </Menu.Item>
                                <Progress
                                    type="circle"
                                    percent={Math.ceil(progressCounter)}
                                    className="progressCounter"
                                    width={140}
                                    trailColor="#ffc107"
                                    strokeColor="#4caf50"
                                />
                            </Menu>
                        </Sider>
                        <Layout className="expandedSider">
                            <Menu
                                mode="horizontal"
                                className="smallScreenSizeMenu"
                                theme="dark"
                                selectedKeys={[currentLocale]}
                            >
                                <SubMenu
                                    key="sub1"
                                    icon={<TranslationOutlined />}
                                    title={<FormattedMessage id="language" />}
                                    onClick={this.handleLanguage}
                                >
                                    <Menu.Item key="en">English</Menu.Item>
                                    <Menu.Item key="fr">Français</Menu.Item>
                                </SubMenu>
                                <Menu.Item
                                    key="about"
                                    icon={<QuestionOutlined />}
                                    onClick={this.showAbout}
                                >
                                    <FormattedMessage id="about" />
                                </Menu.Item>
                                <Menu.Item
                                    key="support"
                                    icon={<HeartOutlined />}
                                    onClick={this.showSupport}
                                >
                                    <FormattedMessage id="support" />
                                </Menu.Item>
                                <div className="progressCounter">
                                    <Progress
                                        percent={Math.ceil(progressCounter)}
                                        size="small"
                                        trailColor="#ffc107"
                                        strokeColor="#4caf50"
                                    />
                                </div>
                            </Menu>
                            <Content className="intentionsContent">
                                <Header className="imageHeader">
                                    <div className="imageTitle">
                                        <img
                                            src="/images/header.jpg"
                                            alt="Snow On The Ridge"
                                        />
                                        <div className="textAboveImage">
                                            <Title>
                                                <FormattedMessage id="pageHeaderTitle" />
                                            </Title>
                                            <Title level={3}>
                                                <FormattedMessage id="pageHeaderSubTitle" />
                                            </Title>
                                        </div>
                                    </div>
                                </Header>
                                <IntentionsForm
                                    locale={this.translations[currentLocale]}
                                    lang={currentLocale}
                                    handleProgress={this.handleProgress}
                                    handleSuccess={this.handleSuccess}
                                />
                            </Content>
                            <Footer className="intentionsFooter">
                                <CopyrightNotice />
                            </Footer>
                        </Layout>
                    </Layout>
                </ConfigProvider>
            </IntlProvider>
        );
    }
}

export default App;
