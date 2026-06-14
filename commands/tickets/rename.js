module.exports = {
    name: "rename",

    async run(message, args) {

        console.log("ARGS :", args);

        try {

            if (!message.channel.name.startsWith("ticket-")) {
                return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
            }

            const newName = args.join("-");

            if (!newName) {
                return message.reply("❌ Utilisation : +rename nouveau-nom");
            }

            console.log("Nouveau nom :", newName);

console.log("Avant renommage");

await message.channel.setName(`ticket-${newName}`);

console.log("Après renommage");

return message.channel.send(
    `✏️ Ticket renommé en \`${message.channel.name}\``
);
        } catch (err) {

            console.error(err);

            return message.reply(
                `❌ ${err.message}`
            );
        }
    }
};
