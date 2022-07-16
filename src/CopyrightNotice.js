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
            <a href="https://explorewilder.com/about">Clement</a> ·{" "}
            <a href="https://github.com/ExploreWilder/intentions/blob/main/LICENSE">
                Copyright
            </a>{" "}
            ·{" "}
            <a href="https://github.com/ExploreWilder/intentions/">
                <FormattedMessage id="source" />
            </a>{" "}
            ·{" "}
            <a href="https://explorewilder.statuspage.io/">
                <FormattedMessage id="status" />
            </a>
        </>
    );
};

export default CopyrightNotice;
