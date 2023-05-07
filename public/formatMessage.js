"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatMessage = ({ name, price, description, link, imageUrl }) => {
    let message = `<b>${name}</b>`;
    if (price) {
        message += `\nPrice: $${price}`;
    }
    if (link) {
        message += `\n<a href="${link}">Link</a>`;
    }
    if (description) {
        message += `\nDescription: ${description}`;
    }
    if (imageUrl) {
        return {
            imageUrl,
            message,
        };
    }
    return {
        message,
    };
};
exports.default = formatMessage;
