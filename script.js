"use strict";

// =============================================
// 1. GET HTML ELEMENTS
// =============================================

const photoInput = document.getElementById("photoInput");
const quoteInput = document.getElementById("quoteInput");
const authorInput = document.getElementById("authorInput");
const dateInput = document.getElementById("dateInput");
const brandInput = document.getElementById("brandInput");
const taglineInput = document.getElementById("taglineInput");
const accentInput = document.getElementById("accentInput");
const downloadBtn = document.getElementById("downloadBtn");

const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");

let photo = new Image();
let photoLoaded = false;
let currentObjectURL = null;


// =============================================
// 2. SET TODAY'S DATE
// =============================================

function getLocalDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.value = getLocalDate();

function formattedDate() {
    if (!dateInput.value) return "";

    const date = new Date(dateInput.value + "T12:00:00");

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// =============================================
// 3. DETERMINE POSTER SIZE
// =============================================

function setPosterSize() {
    const isLandscape =
        photoLoaded && photo.naturalWidth > photo.naturalHeight;

    if (isLandscape) {
        canvas.width = 1350;
        canvas.height = 1080;
    } else {
        canvas.width = 1080;
        canvas.height = 1350;
    }
}


// =============================================
// 4. DRAW THE BACKGROUND PHOTO
// =============================================

function drawPhoto() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background colour before a photo is uploaded.
    ctx.fillStyle = "#e8c49a";
    ctx.fillRect(0, 0, w, h);

    if (!photoLoaded) {
        ctx.fillStyle = "#554b42";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 42px Arial";

        ctx.fillText(
            "Upload a photograph",
            w / 2,
            h / 2
        );

        return;
    }

    // Fill the poster without stretching the photo.
    const scale = Math.max(
        w / photo.naturalWidth,
        h / photo.naturalHeight
    );

    const imageW = photo.naturalWidth * scale;
    const imageH = photo.naturalHeight * scale;

    const imageX = (w - imageW) / 2;
    const imageY = (h - imageH) / 2;

    ctx.save();

    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();

    ctx.drawImage(
        photo,
        imageX,
        imageY,
        imageW,
        imageH
    );

    ctx.restore();
}


// =============================================
// 5. WRAP TEXT INTO LINES
// =============================================

function wrapText(text, maxWidth, font) {
    ctx.font = font;

    const words = text.trim()
        ? text.trim().split(/\s+/)
        : [];

    const lines = [];
    let line = "";

    for (const word of words) {
        const testLine = line
            ? line + " " + word
            : word;

        if (
            ctx.measureText(testLine).width > maxWidth &&
            line !== ""
        ) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }

    if (line) {
        lines.push(line);
    }

    return lines;
}


// =============================================
// 6. DRAW PAGE BRANDING
// =============================================

function drawBrand(w, h) {
    const brand = brandInput.value.trim();
    const tagline = taglineInput.value.trim();

    const margin = w * 0.055;
    const brandSize = Math.min(w * 0.048, 64);
    const taglineSize = Math.min(w * 0.018, 23);

    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    // Brand name.
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;

    ctx.font = `bold ${brandSize}px Arial`;

    ctx.fillText(
        brand,
        w - margin,
        h * 0.035,
        w * 0.48
    );

    // Tagline.
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = `${taglineSize}px Arial`;

    ctx.fillText(
        tagline,
        w - margin,
        h * 0.035 + brandSize + 8,
        w * 0.55
    );
}


// =============================================
// 7. DRAW THE QUOTE BOX
// =============================================

function drawQuotePanel(w, h) {
    const isLandscape = w > h;

    const margin = w * 0.04;
    const panelX = margin;
    const panelW = w - margin * 2;

    const quote = quoteInput.value.trim();
    const author = authorInput.value.trim();
    const date = formattedDate();

    const accent = accentInput.value;

    // Text area inside the panel.
    const sidePadding = panelW * 0.06;
    const textX = panelX + sidePadding;
    const textW = panelW - sidePadding * 2;

    // Quote font changes slightly for each layout.
    let fontSize = isLandscape
        ? Math.min(w * 0.039, h * 0.062)
        : Math.min(w * 0.047, h * 0.047);

    const minimumFontSize = 18;
    const lineSpacing = 1.14;

    const authorSize = Math.min(w * 0.029, h * 0.045);
    const dateSize = Math.min(w * 0.023, h * 0.034);

    // Space reserved for the quotation mark and footer.
    const quoteTopPadding = h * 0.15;
    const panelBottomPadding = h * 0.055;
    const footerGap = h * 0.035;
    const authorDateGap = h * 0.012;

    let lines = [];
    let lineHeight = 0;
    let quoteHeight = 0;
    let footerHeight = 0;
    let panelHeight = 0;

    // Find a font size and panel height that fit the quote.
    while (true) {
        lines = wrapText(
            quote,
            textW,
            `bold ${fontSize}px Arial`
        );

        lineHeight = fontSize * lineSpacing;
        quoteHeight = Math.max(lines.length, 1) * lineHeight;

        footerHeight =
            authorSize +
            authorDateGap +
            dateSize;

        panelHeight =
            quoteTopPadding +
            quoteHeight +
            footerGap +
            footerHeight +
            panelBottomPadding;

        // Keep some of the photograph visible.
        const maximumPanelHeight = h * 0.88;

        if (
            panelHeight <= maximumPanelHeight ||
            fontSize <= minimumFontSize
        ) {
            break;
        }

        fontSize -= 2;
    }

    // If even the smallest font cannot fit, use the maximum box
    // height and continue shrinking the text to avoid overflow.
    const maximumPanelHeight = h * 0.88;

    while (panelHeight > maximumPanelHeight && fontSize > 10) {
        fontSize -= 1;

        lines = wrapText(
            quote,
            textW,
            `bold ${fontSize}px Arial`
        );

        lineHeight = fontSize * lineSpacing;
        quoteHeight = Math.max(lines.length, 1) * lineHeight;

        panelHeight =
            quoteTopPadding +
            quoteHeight +
            footerGap +
            footerHeight +
            panelBottomPadding;
    }

    // Position the box near the bottom of the photograph.
    const actualPanelHeight = Math.min(
        panelHeight,
        maximumPanelHeight
    );

    const panelY = h - actualPanelHeight - h * 0.035;

    // Draw the translucent white box.
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.fillRect(
        panelX,
        panelY,
        panelW,
        actualPanelHeight
    );

    // Large quotation mark.
    ctx.fillStyle = accent;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const markSize = Math.min(w * 0.13, h * 0.13);

    ctx.font = `bold ${markSize}px Georgia`;

    ctx.fillText(
        "“",
        panelX + panelW * 0.045,
        panelY + actualPanelHeight * 0.005
    );

    // Draw the quote.
    ctx.fillStyle = "#090909";
    ctx.font = `bold ${fontSize}px Arial`;

    let currentY = panelY + quoteTopPadding;

    for (const line of lines) {
        ctx.fillText(
            line,
            textX,
            currentY,
            textW
        );

        currentY += lineHeight;
    }

    // Speaker and date stay inside the box.
    const footerStartY = currentY + footerGap;

    // Decorative line.
    ctx.fillStyle = accent;

    ctx.fillRect(
        panelX + panelW * 0.79,
        footerStartY,
        panelW * 0.15,
        Math.max(4, w * 0.004)
    );

    // Author's name.
    ctx.fillStyle = "#111111";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = `bold ${authorSize}px Arial`;

    ctx.fillText(
        author,
        panelX + panelW * 0.94,
        footerStartY + h * 0.02,
        panelW * 0.84
    );

    // Date.
    ctx.font = `bold ${dateSize}px Arial`;

    ctx.fillText(
        date,
        panelX + panelW * 0.94,
        footerStartY + h * 0.02 +
            authorSize * 1.3,
        panelW * 0.84
    );

    // Bottom colour strip.
    const stripHeight = h * 0.018;
    const stripY = h - stripHeight;

    ctx.fillStyle = accent;
    ctx.fillRect(
        0,
        stripY,
        w * 0.333,
        stripHeight
    );

    ctx.fillStyle = "#ffd700";
    ctx.fillRect(
        w * 0.333,
        stripY,
        w * 0.333,
        stripHeight
    );

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
        w * 0.666,
        stripY,
        w * 0.334,
        stripHeight
    );
}


// =============================================
// 8. DRAW THE COMPLETE POSTER
// =============================================

function renderPoster() {
    setPosterSize();

    const w = canvas.width;
    const h = canvas.height;

    drawPhoto();
    drawBrand(w, h);
    drawQuotePanel(w, h);
}


// =============================================
// 9. UPLOAD A PORTRAIT OR LANDSCAPE PHOTO
// =============================================

photoInput.addEventListener("change", function () {
    const file = photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        photoInput.value = "";
        return;
    }

    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
    }

    currentObjectURL = URL.createObjectURL(file);

    const newPhoto = new Image();

    newPhoto.onload = function () {
        photo = newPhoto;
        photoLoaded = true;

        renderPoster();
    };

    newPhoto.onerror = function () {
        alert("The selected photograph could not be opened.");
    };

    newPhoto.src = currentObjectURL;
});


// =============================================
// 10. UPDATE THE PREVIEW AUTOMATICALLY
// =============================================

[
    quoteInput,
    authorInput,
    dateInput,
    brandInput,
    taglineInput,
    accentInput
].forEach(function (element) {
    element.addEventListener("input", renderPoster);
});


// =============================================
// 11. DOWNLOAD THE EXACT PREVIEW
// =============================================

downloadBtn.addEventListener("click", function () {
    try {
        canvas.toBlob(function (blob) {
            if (!blob) {
                alert("The poster could not be created.");
                return;
            }

            const downloadURL = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadURL;
            link.download =
                "daily-quote-" + getLocalDate() + ".png";

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(function () {
                URL.revokeObjectURL(downloadURL);
            }, 2000);

        }, "image/png");

    } catch (error) {
        console.error("Download error:", error);
        alert("Download failed. Please try again.");
    }
});


// =============================================
// 12. START THE DESIGNER
// =============================================

renderPoster();