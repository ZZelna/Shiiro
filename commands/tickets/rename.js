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

            console.log("NEW NAME =", newName);

            try {

                await message.channel.setName(
                    `ticket-${newName}`
                );

                console.log("RENAMED OK");

            } catch (err) {

                console.error(
                    "RENAME ERROR :",
                    err
                );

                return message.reply(
                    `❌ ${err.message}`
                );
            }

            return message.channel.send(
                `✅ Renommé en ticket-${newName}`
            );

        } catch (err) {

            console.error(err);

            return message.reply(
                `❌ ${err.message}`
            );
        }
    }
};
