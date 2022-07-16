import { jsPDF } from "jspdf";
import { createIntl, createIntlCache } from "react-intl";

function arrayBufferToString(buffer) {
    return binaryToString(
        // use the reduce method to convert the buffer in small chunks
        // that is to avoid an "out of range" error on Chrome-based browser
        Array.prototype.slice
            .apply(new Uint8Array(buffer))
            .reduce((data, byte) => {
                return data + String.fromCharCode(byte);
            }, "")
    );
}

function binaryToString(binary) {
    let error;

    try {
        return decodeURIComponent(escape(binary));
    } catch (_error) {
        error = _error;
        if (error instanceof URIError) {
            return binary;
        } else {
            throw error;
        }
    }
}

class pdfGenerator extends jsPDF {
    /**
     * Add some fonts to the PDF, not just for the style, but also to handle
     * unicode (letters, accents, etc.)
     * @param fonts List of fonts.
     * @param data All form data (static fields and members data.)
     * @param locale Current translation.
     * @param lang The current locale codename in two letters.
     * @param callbackOnSuccess The handler called when the PDF has successfully been generated.
     */
    constructor(fonts, data, locale, lang, callbackOnSuccess) {
        const lineHeight = 1.2;
        super({
            unit: "in",
            lineHeight: lineHeight,
        });
        this.handleOnSuccess = callbackOnSuccess;
        this.locale = locale;
        this.cache = createIntlCache();
        this.intl = createIntl(
            {
                locale: lang,
                defaultLocale: lang,
                messages: this.locale,
            },
            this.cache
        );
        this.documentTitle = this.locale.pageHeaderTitle;
        this.lineHeight = lineHeight;
        this.pageWidth = 21 / 2.54;
        this.pageHeight = 29.7 / 2.54;
        this.margin = 0.5;
        this.ptsPerInch = 72;
        this.maxLineWidth = this.pageWidth - this.margin * 2;
        this.currY = this.margin;
        this.setProperties({ title: this.documentTitle });
        this.formData = data;
        let progress = fonts.length;
        fonts.forEach((font) => {
            let oReq = new XMLHttpRequest();
            oReq.open("GET", font.path, true);
            oReq.responseType = "arraybuffer";

            oReq.onload = (oEvent) => {
                const arrayBuffer = oReq.response;
                const filename = font.path.substring(
                    font.path.lastIndexOf("/") + 1
                );
                this.addFileToVFS(filename, arrayBufferToString(arrayBuffer));
                this.addFont(filename, font.name, font.style);
                if (!--progress) {
                    this.generatePdf();
                    this.handleOnSuccess();
                }
            };

            oReq.send(null);
        });
    }

    /**
     * Return the line height based on the current font size
     * @returns {number}
     */
    getLineHeight = () => {
        return (this.getFontSize() * this.lineHeight) / this.ptsPerInch;
    };

    /**
     * Return a human-readable string of the date.
     * @param dateTime
     * @returns {string}
     */
    timeToString = (dateTime) => {
        const date = this.intl.formatDate(dateTime, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
        const time = this.intl.formatTime(dateTime, {
            hour: "numeric",
            minute: "numeric",
        });
        return `${date} ${this.locale.dateTimeGap} ${time}`;
    };

    /**
     * Return one of the two datetime in the time range.
     * @param id 0 or 1.
     * @returns {string} Human-readable string of the date.
     */
    timeRangeToString = (id) => {
        if (this.formData.timeRange === undefined) {
            return this.locale.unknown;
        }
        return this.timeToString(this.formData.timeRange[id].toDate());
    };

    /**
     * Move the cursor down with a specific number of lines.
     * @param totalLines Can be any positive number (2 for 2 lines, 0.5 for half a line)
     */
    moveCursorDown = (totalLines = 1) => {
        const oneLineHeight = this.getLineHeight();
        const footerHeight = 2 * oneLineHeight;
        this.currY += totalLines * oneLineHeight;
        if (this.currY > this.pageHeight - this.margin - footerHeight) {
            this.currY += oneLineHeight;
            const prevFont = this.getFont();
            const prevSize = this.getFontSize();
            this.setFont("myText", "normal").setFontSize(10);
            this.text(
                `${this.locale.page} ${this.currPage} (${this.locale.pto})`,
                this.pageWidth / 2,
                this.currY,
                { align: "center" }
            );
            this.setFont(prevFont.fontName, prevFont.fontStyle).setFontSize(
                prevSize
            );
            this.addPage();
            this.currY = this.margin;
        }
    };

    /**
     * Add a new line, a grey line, some space, and an other new line.
     * @param height Line width
     */
    addHr = (height = 0.01) => {
        this.moveCursorDown();
        this.setDrawColor(127, 127, 127);
        this.setLineWidth(height);
        this.line(
            this.margin,
            this.currY,
            this.pageWidth - this.margin,
            this.currY
        );
        this.currY += 6 * height;
        this.moveCursorDown();
    };

    /**
     * Add a section: a small line as separator, a title and 2 new lines, all centered to the page.
     * @param title Section title.
     * @param hrHeight Line height (thickness)
     * @param hrWidth Line width (wideness)
     */
    addSection = (title, hrHeight = 0.01, hrWidth = 3) => {
        this.currY += 6 * hrHeight;
        this.setLineWidth(hrHeight);
        this.line(
            (this.pageWidth - hrWidth) / 2,
            this.currY,
            (this.pageWidth + hrWidth) / 2,
            this.currY
        );
        this.moveCursorDown();
        this.text(title, this.pageWidth / 2, this.currY, { align: "center" });
        this.moveCursorDown(2);
    };

    /**
     * Generate the PDF (to be called only one time per instance).
     */
    generatePdf = () => {
        this.currPage = 1;

        // title:
        this.currY += 0.2;
        this.setFont("myTitle", "normal").setFontSize(28);
        this.text(this.documentTitle, this.pageWidth / 2, this.currY, {
            align: "center",
        });

        // expected date of return:
        this.setFont("myText", "bold").setFontSize(16);
        this.addHr(0.02);
        this.text(
            `${this.locale.expectedDateOfReturn} ${this.timeRangeToString(1)}`,
            this.pageWidth / 2,
            this.currY,
            { align: "center" }
        );

        // start date:
        this.setFont("myText", "normal").setFontSize(12);
        this.moveCursorDown(2);
        this.text(
            `${this.locale.startDate} ${this.timeRangeToString(0)}`,
            this.margin,
            this.currY
        );

        // activity:
        this.text(
            `${this.locale.activityLabel} ${
                this.formData.activity ?? this.locale.unknown
            }`,
            this.pageWidth - this.margin,
            this.currY,
            { align: "right" }
        );

        // trip intentions details:
        this.moveCursorDown(2);
        this.setFont("myText", "bold").setFontSize(12);
        let textLines = this.splitTextToSize(
            this.locale.tripIntentionsDetailsLabel,
            this.maxLineWidth
        );
        textLines.forEach((textLine) => {
            this.text(textLine, this.margin, this.currY);
            this.moveCursorDown();
        });
        this.setFont("myText", "normal").setFontSize(12);
        const str = this.formData.tripIntentionsDetails ?? this.locale.unknown;
        textLines = this.splitTextToSize(str, this.maxLineWidth);
        textLines.forEach((textLine) => {
            this.text(textLine, this.margin, this.currY);
            this.moveCursorDown();
        });

        // trip intentions note (logbook):
        this.moveCursorDown();
        this.setFont("myText", "italic").setFontSize(8);
        textLines = this.splitTextToSize(
            `${this.locale.note} ${this.locale.tripIntentionsDetailsExtra}.`,
            this.maxLineWidth
        );
        textLines.forEach((textLine) => {
            this.text(textLine, this.margin, this.currY);
            this.moveCursorDown();
        });

        // members:
        this.setFont("myText", "bold").setFontSize(12);
        this.addHr();
        this.isTeamLeader = false;
        this.isNotAlone = this.formData.members.length > 1;
        if (this.isNotAlone) {
            this.text(this.locale.aboutTeam, this.margin, this.currY);
            this.moveCursorDown();
            this.isTeamLeader = true;
        } else {
            this.text(this.locale.aboutSolo, this.margin, this.currY);
            this.moveCursorDown();
        }
        this.setFont("myText", "normal");
        this.formData.members.forEach(this.addMember);
        this.moveCursorDown();

        // essential gear list:
        if (this.formData.essentialGear) {
            this.addEssentialGear();
        }

        // logistics:
        if (this.formData.prePostTripIntentions) {
            this.addTextareaInput(
                this.locale.prePostTripIntentionsLabel,
                this.formData.prePostTripIntentions
            );
        }
        if (this.formData.postTripIntentionsDetails) {
            this.addTextareaInput(
                this.locale.postTripIntentionsDetailsLabel,
                this.formData.postTripIntentionsDetails
            );
        }

        // important notice:
        this.addNotice();

        this.save("trip_intentions.pdf", { returnPromise: true });
    };

    /**
     * Add one member.
     * @param member Member data
     */
    addMember = (member) => {
        let name = "";
        if (member.firstName && member.familyName) {
            name = `${this.locale.nameLabel} ${
                member.firstName
            } ${member.familyName.toUpperCase()} `;
        } else if (member.firstName || member.familyName) {
            name = `${this.locale.nameLabel} ${
                member.firstName ?? member.familyName
            } `;
        }
        if (this.isTeamLeader) {
            this.addSection(this.locale.detailsTeamLeader);
        } else if (this.isNotAlone) {
            this.addSection(this.locale.detailsTeamMember);
        }
        this.isTeamLeader = false;
        if (name) {
            this.moveCursorDown();
            this.text(name, this.margin, this.currY);
        }
        if (member.phoneNumber) {
            if (name) {
                this.text(
                    `${this.locale.phoneNumberLabel} ${member.phoneNumber}`,
                    this.pageWidth - this.margin,
                    this.currY,
                    { align: "right" }
                );
            } else {
                this.moveCursorDown();
                this.text(
                    `${this.locale.phoneNumberLabel} ${member.phoneNumber}`,
                    this.margin,
                    this.currY
                );
            }
        }
        if (member.level) {
            this.moveCursorDown();
            this.text(
                `${this.locale.levelDetails} ${
                    this.locale[`level${member.level}`]
                }`,
                this.margin,
                this.currY
            );
        }
        if (member.sex) {
            if (member.level) {
                this.text(
                    `${this.locale.sexLabel} ${member.sex}`,
                    this.pageWidth - this.margin,
                    this.currY,
                    { align: "right" }
                );
            } else {
                this.moveCursorDown();
                this.text(
                    `${this.locale.sexLabel} ${member.sex}`,
                    this.margin,
                    this.currY
                );
            }
        }
        if (member.isHealthy || member.healthDetails) {
            this.moveCursorDown();
            this.text(
                this.locale.medicalConditionsMedicationLabel,
                this.margin,
                this.currY
            );
            this.moveCursorDown();
            this.text(
                member.isHealthy ? this.locale.healthy : member.healthDetails,
                this.margin,
                this.currY
            );
        }
        if (member.identity) {
            this.addMemberInput(this.locale.identityPdfLabel, member.identity);
        }
        if (member.description) {
            this.addMemberInput(
                this.locale.descriptionLabel,
                member.description
            );
        }
        this.moveCursorDown();
    };

    /**
     * Add a one-line description and a multi-line text, without new line.
     * @param label One-line text.
     * @param text Multi-line text.
     */
    addMemberInput = (label, text) => {
        this.moveCursorDown();
        this.text(label, this.margin, this.currY);
        const textLines = this.splitTextToSize(text, this.maxLineWidth);
        textLines.forEach((textLine) => {
            this.moveCursorDown();
            this.text(textLine, this.margin, this.currY);
        });
    };

    /**
     * Add a one-line description in bold, a multi-line text, and a blank line.
     * @param label One-line text.
     * @param text Multi-line text.
     */
    addTextareaInput = (label, text) => {
        this.setFont("myText", "bold").setFontSize(12);
        this.text(label, this.margin, this.currY);
        this.setFont("myText", "normal").setFontSize(12);
        const textLines = this.splitTextToSize(text, this.maxLineWidth);
        textLines.forEach((textLine) => {
            this.moveCursorDown();
            this.text(textLine, this.margin, this.currY);
        });
        this.moveCursorDown(2);
    };

    /**
     * Essential gear list.
     */
    addEssentialGear = () => {
        this.setFont("myText", "bold").setFontSize(12);
        this.text(this.locale.essentialGearExtra, this.margin, this.currY);
        this.moveCursorDown(0.5);
        this.setFont("myText", "normal").setFontSize(12);
        const circleRadius = 0.03;
        const offsetLeft = 0.2;
        const gapAfterCircle = 0.03;
        const posLeft =
            this.margin + offsetLeft + 2 * circleRadius + gapAfterCircle;
        this.formData.essentialGear.forEach((gearItem) => {
            this.moveCursorDown();
            this.setFillColor(0); // black
            this.circle(
                this.margin + offsetLeft - circleRadius,
                this.currY - 1.5 * circleRadius,
                circleRadius,
                "F"
            );
            this.text(gearItem, posLeft, this.currY);

            // add sat phone number:
            if (gearItem === this.locale["gear9"]) {
                const sep = " - ";
                let extraOffsetLeft = posLeft + this.getTextWidth(gearItem);
                this.text(sep, extraOffsetLeft, this.currY);
                extraOffsetLeft += this.getTextWidth(sep);
                this.setFont("myText", "bold").setFontSize(12);
                this.text(
                    this.formData.satPhoneNumber,
                    extraOffsetLeft,
                    this.currY
                );
                this.setFont("myText", "normal").setFontSize(12);
            }
        });
        this.moveCursorDown(2);
    };

    /**
     * End of document.
     */
    addNotice = () => {
        this.setFont("myText", "bold").setFontSize(11);
        this.addHr();
        this.text(this.locale.rememberNotice, this.pageWidth / 2, this.currY, {
            align: "center",
        });
        this.moveCursorDown(2);

        this.setFont("myText", "bold").setFontSize(12);
        this.text(
            this.locale.trustedContactInstructionsLabel,
            this.margin,
            this.currY
        );
        this.moveCursorDown();
        this.setFont("myText", "normal").setFontSize(12);
        let textLines = this.splitTextToSize(
            this.isNotAlone
                ? this.locale.trustedContactInstructionsTeam
                : this.locale.trustedContactInstructionsSolo,
            this.maxLineWidth
        );
        textLines.forEach((textLine) => {
            this.moveCursorDown();
            this.text(textLine, this.margin, this.currY);
        });

        this.addHr();
        this.setFont("myText", "bold").setFontSize(8);
        this.text(this.locale.termsAndConditionsLabel, this.margin, this.currY);
        this.setFont("myText", "italic").setFontSize(8);
        this.moveCursorDown();
        textLines = this.splitTextToSize(
            this.locale.termsAndConditionsDesc,
            this.maxLineWidth
        );
        textLines.forEach((textLine) => {
            this.moveCursorDown();
            this.text(textLine, this.margin, this.currY);
        });
        this.setFont("myText", "bold").setFontSize(8);
        this.moveCursorDown(3);
        this.setFont("myTitle", "bold").setFontSize(9);
        this.textWithLink(this.locale.signaturePdf, this.margin, this.currY, {
            url: "https://github.com/coffeacloudberry/intentions",
        });
        const signatureWidth = this.getTextWidth(
            this.locale.signaturePdf + " "
        );
        this.text(
            `${this.locale.dateTimeBefore} ${this.timeToString(new Date())}`,
            this.margin + signatureWidth,
            this.currY
        );
        this.setFont("myTitle", "bold").setFontSize(12);
        this.text(
            this.locale.wishPdf,
            this.pageWidth - this.margin,
            this.currY,
            {
                align: "right",
                baseline: "middle",
            }
        );
    };
}

export default pdfGenerator;
