import * as docs from "ghom-djs-docs"
import * as app from "../app.js"
import * as core from "../app/core.js"

export default new app.Command({
  name: "search",
  description: "Search object in documentation",
  channelType: "all",
  isDefault: true,
  middlewares: [
    new app.Middleware("bot only", ({ author }) => {
      if (author.bot) app.die("Can only be used by a human.")
    }),
  ],
  rest: {
    name: "path",
    description: "The documentation path",
    required: true,
  },
  flags: [
    {
      name: "raw",
      flag: "r",
      description: "Get raw data",
    },
    {
      name: "format",
      flag: "f",
      description: "Format raw data",
    },
  ],
  async run(message) {
    const sourceName = await app.getUserSourceName(message.author)
    const result = await docs.search(sourceName, message.args.path)

    if (message.args.raw && result)
      return message.channel.send(
        core.code.stringify({
          lang: "json",
          content: JSON.stringify(
            result,
            (key, value) => {
              if (key === "parent") return
              else return value
            },
            message.args.format ? 2 : undefined
          ).slice(0, 1500),
        })
      )

    if (result || !message.usedAsDefault)
      return message.channel.send(await app.docEmbed(sourceName, result))
  },
})
