import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { Client } from "@notionhq/client";
import TelegramBot from "node-telegram-bot-api";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

import formatMessage from "./formatMessage";
import formatNotionUpdates from "./formatNotionData";

type Message = {
  name: string;
  price: number;
  description: string;
  link: string;
  imageUrl: string;
};

type FormattedMessage = {
  message: string;
  imageUrl?: string;
};

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const telegram = new TelegramBot(`${process.env.TELEGRAM_BOT_TOKEN}`);

let lastEditedTime: string = new Date().toISOString();

export const sendTelegramMessage = (message: FormattedMessage) => {
  if (message?.imageUrl) {
    return telegram.sendPhoto(`${process.env.CHAT_ID}`, message.imageUrl, {
      caption: message.message,
      parse_mode: "HTML",
    });
  } else {
    return telegram.sendMessage(`${process.env.CHAT_ID}`, message.message, {
      disable_web_page_preview: true,
      parse_mode: "HTML",
    });
  }
};

const sendNotionUpdates = async (dbResponse: QueryDatabaseResponse) => {
  const messages = formatNotionUpdates(dbResponse);
  const formattedMessages = messages.map((message) => formatMessage(message));

  formattedMessages.map(async (message) => {
    try {
      await sendTelegramMessage(message);
    } catch (error) {
      console.log(error);
    }
  });
};

const fetchNotionDB = async (database_id: string) => {
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
    console.log(lastEditedTime);
    console.log(response);
    if (response.results.length > 0) {
      await sendNotionUpdates(response);
      // @ts-ignore
      lastEditedTime = response.results[0].last_edited_time;
    }
  } catch (error) {
    console.error(error);
  }
};

const notionDBIdByUsername = {
  [`${process.env.USERNAME1}`]: `${process.env.NOTION_DB1_ID}`,
  [`${process.env.USERNAME2}`]: `${process.env.NOTION_DB2_ID}`,
};

type Username = keyof typeof notionDBIdByUsername;

export const sendToNotion = async (message: Message, username: Username) => {
  try {
    const newPage = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: notionDBIdByUsername[username],
      },
      properties: {
        Name: {
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
    // @ts-ignore
    lastEditedTime = newPage.last_edited_time;
  } catch (error) {
    console.log(error);
  }
};

export const useWebhook = async (message: TelegramBot.Message) => {
  if (
    message.from?.username !== process.env.USERNAME1 &&
    message.from?.username !== process.env.USERNAME2
  ) {
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
  const message = formatMessage(data);
  console.log(req.body);

  try {
    await sendTelegramMessage(message);
    await sendToNotion(data, username);
    return res.status(200).json(message);
  } catch (error) {
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
  } catch (error) {
    console.error("Error sending message");
    console.log(error);
  }
  res.status(200).json({});
})

const PORT = "3000";

app.listen(PORT, () => {
  console.log("Server started");
});

export default app;
