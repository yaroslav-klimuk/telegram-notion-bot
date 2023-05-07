My girlfriend and I were arguing about where to keep a wishlist with gift ideas for each other. I suggested notion because I really like it, but my girlfriend wanted to do it in a telegram chat. One day I thought "why choose?" and wrote this bot + [webapp](https://github.com/yaroslav-klimuk/wishlist-telegram-webapp). <br>
This bot accepts gift object on POST request from webapp then formats data and sends to chat + notion database. <br>
The bot also has the `/update` command to synchronize last changes from notion db to chat. <br>

Notion database must have fields of the following types:
* Name: Title
* Link: URL
* Image: Files & media
* Price: Number
* Description: Text
* Last edited time <br>

Example:
<img width="1134" alt="Screenshot 2023-05-07 at 23 11 18" src="https://user-images.githubusercontent.com/70700647/236702742-4f479b20-dddf-4c7e-a010-283ae618b595.png">

The bot only supports two specific users. If desired, you can easily add support for more users. <br>

To run the bot, you need to set up integration in Notion, create a telegram bot and chat and enter your values into environment variables. <br>

The project was written for the most part for fun and may contain errors. Anyway PR are welcome 🙂
