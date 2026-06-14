module.exports = {
    name: "rename",

    async run(message, args) {

        console.log("=== RENAME START ===");
        console.log("ARGS :", args);

        try {

            const newName = args.join("-");

            console.log("NEW NAME =", newName);

            await message.channel.setName(`ticket-${newName}`);

            console.log("RENAMED OK");

            return message.channel.send(
                `✅ Renommé en ticket-${newName}`
            );

        } catch (err) {

            console.error("RENAME ERROR :", err);

            return message.reply(
                `❌ ${err.message}`
            );
        }
    }
};
