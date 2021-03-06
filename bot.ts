import { Bot, session } from "https://deno.land/x/grammy/mod.ts";
import {
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

import { BOT_TOKEN, DENO_ENV } from "./constants.ts";
import { addSticker } from "./conversations/addSticker.ts";
import { createNewPack } from "./conversations/createNewPack.ts";
import { MyContext, SessionData } from "./types.ts";

export const bot = new Bot<MyContext>(BOT_TOKEN);
const storage =
  DENO_ENV === "PRODUCTION" ? freeStorage<SessionData>(bot.token) : undefined;

bot.use(
  session({
    initial: (): SessionData => ({
      sets: [],
      fastMode: false,
    }),
    storage,
  })
);

bot.command("cancel", (ctx) => {
  delete ctx.session.conversation;
});

bot.use(conversations());
bot.use(createConversation(createNewPack));
bot.use(createConversation(addSticker));

bot.command(
  "newpack",
  async (ctx) => await ctx.conversation.enter("createNewPack")
);
bot.command(
  "addsticker",
  async (ctx) => await ctx.conversation.enter("addSticker")
);
bot.command("delpack", async (ctx) => {
  await ctx.reply("You can delete your pack from the official @stickers bot ");
});

bot.command("start", async (ctx) => {
  return await ctx.reply(
    "Hello! I am a bot that helps you create sticker packs easily, please enter /newpack to start new pack or /addSticker to add sticker to your existing pack \n\n Please notice that, this sticker is still under development, so you might get unexpected results. Please report any bugs to Ali @mi3lix9! "
  );
});

bot.command("log", async (ctx, next) => {
  await ctx.reply(JSON.stringify(ctx.session.sets));
  await ctx.reply(typeof ctx.session.sets);
});

bot.command("resetbot", (ctx) => {
  ctx.session = {
    sets: [],
    fastMode: false,
  };
  return ctx.reply("Bot reset");
});

bot.errorBoundary(async (error, next) => {
  console.error({ error, user: error.ctx.from });
  await error.ctx.reply("Something went wrong, please try again later.");
});
