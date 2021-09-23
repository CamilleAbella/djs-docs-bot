import * as app from "../app.js"

export default new app.Command({
  name: "help",
  aliases: ["h", "usage"],
  botPermissions: ["SEND_MESSAGES"],
  channelType: "all",
  description: "Help menu",
  longDescription: "Display all commands of bot or detail a target command.",
  positional: [
    {
      name: "command",
      description: "The target command name.",
    },
  ],
  async run(message) {
    if (message.args.command) {
      const cmd = app.commands.resolve(message.args.command)

      if (cmd) {
        return app.sendCommandDetails(message, cmd)
      } else {
        await message.channel.send({
          embeds: [
            new app.MessageEmbed()
              .setColor("RED")
              .setAuthor(
                `Unknown command "${message.args.command}"`,
                message.client.user?.displayAvatarURL()
              ),
          ],
        })
      }
    } else {
      const sourceName = await app.getUserSourceName(message.author)
      const lib = app.getLib(sourceName)
      const inviteLink = message.client.generateInvite({
        scopes: ["bot"],
        permissions: [
          app.Permissions.FLAGS.ATTACH_FILES,
          app.Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
        ],
      })

      await message.channel.send({
        embeds: [
          new app.MessageEmbed()
            .setColor(lib.color)
            .setAuthor(
              `Bot invitation link`,
              message.client.user?.avatarURL({ dynamic: true }) ?? undefined
            )
            .setDescription(
              `Gateway between the Discord.js docs and Discord.\n` +
                `Bot in open source, its code is shared in [GitHub](https://github.com/CamilleAbella/djs-docs-bot).\n` +
                `🔗 [Invitation link](${inviteLink}) | 🔗 [Support server](https://discord.gg/3vC2XWK)`
            ),
        ],
      })

      return message.channel.send({
        embeds: [
          new app.MessageEmbed()
            .setColor(lib.color)
            .setAuthor(`How to use documentations ?`, lib.image)
            .setDescription(
              `**Syntax** : \`${message.usedPrefix}Parent [Child [Child [Child [...]]]]\`\n` +
                `**Rules** ↓\n` +
                `🔹 Write your arguments as if they were a path.\n` +
                `🔹 Your arguments must be separated by spaces.\n` +
                `🔹 You can not start your path with a child.\n` +
                `**To test** ↓ \`\`\`\n` +
                `\t${message.usedPrefix}client\n` +
                `\t${message.usedPrefix}message.reply\n` +
                `\t${message.usedPrefix}guildmember.user.send\n` +
                `\t${message.usedPrefix}guildmember.user.send.options\n` +
                `\`\`\``
            )
            .setFooter(`For all commands: ${message.usedPrefix}help all`),
        ],
      })
    }
  },
  subs: [
    new app.Command({
      name: "all",
      aliases: ["ls", "list", "full"],
      channelType: "all",
      description: "Get all commands of bot",
      async run(message) {
        new app.Paginator({
          pages: app.Paginator.divider(
            app.commands.map((cmd) => {
              return app.commandToListItem(message, cmd)
            }),
            10
          ).map((page) => {
            return new app.MessageEmbed()
              .setColor("BLURPLE")
              .setAuthor(
                "Command list",
                message.client.user?.displayAvatarURL()
              )
              .setDescription(page.join("\n"))
              .setFooter(`${message.usedPrefix}help <command>`)
          }),
          channel: message.channel,
          filter: (reaction, user) => user.id === message.author.id,
        })
      },
    }),
  ],
})
