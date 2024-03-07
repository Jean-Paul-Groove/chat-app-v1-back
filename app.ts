import {
  Notification,
  ScopeOption,
  UserOption,
} from "kuzzle";
import { MyApplication } from "./lib/MyApplication";
import ChatMessageController from "./controller/chat-messages";

const app = new MyApplication();
app.config.content.server.protocols.websocket.sendPingsAutomatically = true

const chatMessageController = new ChatMessageController(app);
app.controller.use(chatMessageController);
app
  .start()
  .then(async () => {
    //Creation of chat-messages collection
    if (!(await app.sdk.index.exists("chat"))) {
      await app.sdk.index.create("chat");
    }
    if (!(await app.sdk.collection.exists("chat", "chat-messages"))) {
      await app.sdk.collection.create("chat", "chat-messages", {
        mappings: {
          dynamic: "false",
          properties: {
            message: { type: "text",  },
            name: { type: "keyword" },
          },
        },
      });
    }

//Subscription to the collection
    function callback(notification: Notification) {
      console.log(notification);
    }
    const options = { users: UserOption.all, scope: ScopeOption.all };
    await app.sdk.realtime.subscribe(
      "chat",
      "chat-messages",
      {},
      callback,
      options
    );
  })

  .catch(console.error);
