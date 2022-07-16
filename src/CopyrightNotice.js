import React from "react";
import { FormattedMessage } from "react-intl";

/**
 * Legal text with associated links.
 * @returns {JSX.Element}
 * @constructor
 */
const CopyrightNotice = () => {
    return (
        <>
            <em>
                <FormattedMessage id="pageHeaderTitle" />
            </em>{" "}
            · <FormattedMessage id="createdBy" />{" "}
            <a href="https://www.explorewilder.com/#!/en/about">Clement</a> ·{" "}
            <a href="https://raw.githubusercontent.com/coffeacloudberry/intentions/main/LICENSE.pdf">
                Copyright
            </a>{" "}
            ·{" "}
            <a href="https://github.com/coffeacloudberry/intentions">
                <FormattedMessage id="source" />
            </a>
        </>
    );
};

export default CopyrightNotice;
