My girlfriend and I were arguing about where to keep a wishlist with gift ideas for each other. I suggested notion because I really like it, but my girlfriend wanted to do it in a telegram chat. One day I thought "why choose?" and wrote this bot + [webapp](https://github.com/yaroslav-klimuk/wishlist-telegram-webapp). <br>
This bot accepts gift object on POST request from webapp then formats data and sends to chat + notion database. <br>
The bot also has the `/update` command to synchronize last changes from notion db to chat. <br>

Notion database must have fields of the following types:
* Product name: Title
* Link: URL
* Image: Files & media
* Price: Number
* Description: Text
* Last edited time <br>

Example: <br>
<img width="1098" alt="Screenshot 2023-05-07 at 23 55 29" src="https://user-images.githubusercontent.com/70700647/236704395-728cf051-182e-4e22-af12-966257b0ac74.png">


The bot only supports two specific users. If desired, you can easily add support for more users. <br>
Each user must have their own database. In this example, the databases of both users are in the same account and notion integration. You can update the project for sync databases from different accounts. <br>
To run the bot, you need to set up integration in Notion, create a telegram bot and chat and enter your values into environment [variables](https://github.com/yaroslav-klimuk/telegram-notion-bot/blob/39d2abacfb3adaded5cd0db7d2c5edd33b32adff/.env). <br>

The project was written for the most part for fun and may contain errors. Anyway PR are welcome 🙂
