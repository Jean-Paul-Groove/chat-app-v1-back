import {
  Backend,
  Controller,
  KuzzleError,
  KuzzleRequest,
} from "kuzzle";

export default class ChatMessageController extends Controller {
  constructor(app: Backend) {
    super(app);

    this.definition = {
      actions: {
        postMessage: {
          handler: this.postMessage,
        },
        getMessages: {
          handler: this.getMessages,
        },
      },
    };
  }

  async postMessage(request: KuzzleRequest) {
    try {
      const message = request.getString("message");
      const name = request.getString("name");
      await this.checkMessage(message,name)
      await this.app.sdk.document.create("chat", "chat-messages", {
        message,
        name,
      });
    } catch (error) {
      console.log(error);
      request.response.status = error.status;
      return error.message;
    }
  }
  async getMessages(request: KuzzleRequest) {
    try {
      const messages = await this.app.sdk.document.search(
        "chat",
        "chat-messages"
      );
      return messages.hits;
    } catch (error) {
      console.log(error);
      request.response.status = error.status;
    }
  }
  async checkMessage(message:string, name:string){
    if (message.length > 255) {
      const error = new KuzzleError(
        "Votre message est trop long",
        400,
        "0x02010002"
      );
      throw error;
    }
    if (message.toLowerCase().includes("merde")) {
      await this.app.sdk.realtime.publish("chat", "chat-messages", {
        alert: name + " has been impolite",
      });
      throw new KuzzleError("Vous avez été vulgaire !", 400, "0x0201000b");
    }
  }
}
