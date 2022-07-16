import { Steps } from "antd";
import React from "react";
import { useIntl } from "react-intl";

const { Step } = Steps;

/**
 * Content of the modal used as feedback when the PDF has been successfully generated.
 * @returns {JSX.Element}
 * @constructor
 */
const ModalPdfCreationSuccess = () => {
    const { formatMessage } = useIntl();
    let todo = [];
    for (let i = 0; i <= 4; i++) {
        todo.push(
            <Step
                title={formatMessage({ id: "onPdfSuccessContentStep" + i })}
            />
        );
    }

    return (
        <Steps direction="vertical" size="small" current={1}>
            {todo}
        </Steps>
    );
};

export default ModalPdfCreationSuccess;
