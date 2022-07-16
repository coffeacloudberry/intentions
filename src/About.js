import React from "react";
import { Collapse, Image } from "antd";
import { useIntl } from "react-intl";
const { Panel } = Collapse;

/**
 * Component contained in the drawer. It's designed as a Frequently Asked Questions.
 * @returns {JSX.Element}
 * @constructor
 */
const About = () => {
    const { formatMessage } = useIntl();
    const sections = ["What", "How", "Privacy", "Security", "Me", "Support"];
    let panels = [];

    sections.forEach((section) => {
        panels.push(
            <Panel
                header={formatMessage({ id: `about${section}Title` })}
                key={panels.length}
                className="aboutPanel"
            >
                {section === "Me" ? (
                    <Image
                        src="/images/scenic_camp.jpg"
                        className="imageAbout"
                    />
                ) : (
                    ""
                )}
                <p
                    dangerouslySetInnerHTML={{
                        __html: formatMessage({ id: `about${section}Desc` }),
                    }}
                ></p>
                {section === "Support" ? (
                    <a href="https://ko-fi.com/explorewilder">
                        <img
                            src="/images/BuyMeACoffee.png"
                            alt={formatMessage({ id: "buyMeACoffee" })}
                        />
                    </a>
                ) : (
                    ""
                )}
            </Panel>
        );
    });

    return (
        <Collapse defaultActiveKey={["0", "1", "4", "5"]} ghost>
            {panels}
        </Collapse>
    );
};

export default About;
