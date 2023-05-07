"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramMessage = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const client_1 = require("@notionhq/client");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const formatMessage_1 = __importDefault(require("./formatMessage"));
const formatNotionData_1 = __importDefault(require("./formatNotionData"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
dotenv.config();
const notion = new client_1.Client({ auth: process.env.NOTION_KEY });
const telegram = new node_telegram_bot_api_1.default(`${process.env.TELEGRAM_BOT_TOKEN}`);
let lastEditedTime = new Date().toISOString();
const sendTelegramMessage = (message) => {
    if (message?.imageUrl) {
        return telegram.sendPhoto(`${process.env.CHAT_ID}`, message.imageUrl, {
            caption: message.message,
            parse_mode: "HTML",
        });
    }
    else {
        return telegram.sendMessage(`${process.env.CHAT_ID}`, message.message, {
            disable_web_page_preview: true,
            parse_mode: "HTML",
        });
    }
};
exports.sendTelegramMessage = sendTelegramMessage;
const sendNotionUpdates = async (dbResponse) => {
    const messages = (0, formatNotionData_1.default)(dbResponse);
    const formattedMessages = messages.map((message) => (0, formatMessage_1.default)(message));
    formattedMessages.map(async (message) => {
        try {
            await (0, exports.sendTelegramMessage)(message);
        }
        catch (error) {
            console.log(error);
        }
    });
};
const fetchNotionDB = async (database_id) => {
    try {
        const response = await notion.databases.query({
            database_id,
            filter: {
                or: [
                    {
                        last_edited_time: { after: lastEditedTime },
                        property: "Last edited time",
                    },
                ],
            },
        });
        if (response.results.length > 0) {
            await sendNotionUpdates(response);
            lastEditedTime = response.results[0].last_edited_time;
        }
    }
    catch (error) {
        console.error(error);
    }
};
const notionDBIdByUsername = {
    [`${process.env.USERNAME1}`]: `${process.env.NOTION_DB1_ID}`,
    [`${process.env.USERNAME2}`]: `${process.env.NOTION_DB2_ID}`,
};
const sendToNotion = async (message, username) => {
    try {
        const newPage = await notion.pages.create({
            parent: {
                type: "database_id",
                database_id: notionDBIdByUsername[username],
            },
            properties: {
                'Product name': {
                    title: [
                        {
                            text: {
                                content: message.name,
                            },
                        },
                    ],
                },
                Link: {
                    url: message.link || null,
                    type: "url",
                },
                ...(message.imageUrl && {
                    Image: {
                        files: [
                            {
                                external: {
                                    url: message.imageUrl,
                                },
                                name: message.name,
                            },
                        ],
                    },
                }),
                Price: {
                    number: Number(message.price) || null,
                    type: "number",
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: message.description,
                            },
                        },
                    ],
                },
            },
        });
        console.log(newPage);
        lastEditedTime = newPage.last_edited_time;
    }
    catch (error) {
        console.log(error);
    }
};
const useWebhook = async (message) => {
    if (message.from?.username !== process.env.USERNAME1 &&
        message.from?.username !== process.env.USERNAME2) {
        telegram.sendMessage(message.chat.id, "You can't use me!");
        return;
    }
    if (message?.text?.includes("/update")) {
        await fetchNotionDB(`${process.env.NOTION_DB1_ID}`);
        await fetchNotionDB(`${process.env.NOTION_DB2_ID}`);
    }
};
app.get("/", (req, res) => {
    res.send("Express");
});
app.post("/new", async (req, res) => {
    const { data, username } = req.body;
    const message = (0, formatMessage_1.default)(data);
    console.log(req.body);
    try {
        await (0, exports.sendTelegramMessage)(message);
        await sendToNotion(data, username);
        return res.status(200).json(message);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
});
app.post("/webhook", async (req, res) => {
    const { body } = req;
    console.log(body);
    try {
        if (body?.message) {
            console.log(req.body);
            await useWebhook(body.message);
        }
    }
    catch (error) {
        console.error("Error sending message");
        console.log(error);
    }
    res.status(200).json({});
});
const PORT = "3000";
app.listen(PORT, () => {
    console.log("Server started");
});
exports.default = app;
