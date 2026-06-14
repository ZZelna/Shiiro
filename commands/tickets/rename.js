module.exports = {
    name: "rename",

    async run(message, args) {

        try {

            if (!message.channel.name.startsWith("ticket-")) {
                return message.reply(
                    "❌ Cette commande doit être utilisée dans un ticket."
                );
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

            return message.channel.send(
                `✏️ Ticket renommé en \`${message.channel.name}\``
            );

        } catch (error) {

            console.error(error);

            return message.reply(
                `❌ Erreur : ${error.message}`
            );
        }
    }
};
