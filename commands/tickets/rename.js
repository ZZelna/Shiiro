module.exports = {
    name: "rename",

    async run(message, args) {

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        const newName = args.join("-");

        if (!newName) {
            return message.reply(
                "❌ Utilisation : +rename nouveau-nom"
            );
        }

        await message.channel.setName(
            `ticket-${newName}`
        );

        message.channel.send(
            `✏️ Ticket renommé en \`${message.channel.name}\``
        );
    }
}
