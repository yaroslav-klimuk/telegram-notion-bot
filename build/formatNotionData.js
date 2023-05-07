"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatNotionUpdates = (dataBaseResponse) => {
    return dataBaseResponse.results.map((page) => {
        const { Name, Price, Link, Description, Image } = page.properties;
        const imageObj = Image.files.length ? Image.files[0] : null;
        let imageUrl = null;
        if (imageObj) {
            imageUrl =
                imageObj.type === "file" ? imageObj.file.url : imageObj.external.url;
        }
        const giftItem = {
            name: Name.title[0].plain_text,
            ...(Price.number && { price: Price.number }),
            ...(Link.url && { link: Link.url }),
            ...(Description.rich_text.length && {
                description: Description.rich_text[0].plain_text,
            }),
            ...(imageUrl && { imageUrl }),
        };
        return giftItem;
    });
};
exports.default = formatNotionUpdates;
