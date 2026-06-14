module.exports = {
    name: "rename",

    async run(message, args) {

        console.log("=== RENAME START ===");
        console.log("ARGS :", args);
try {

    await message.channel.setName(`ticket-${newName}`);

    console.log("RENAMED OK");

} catch (err) {

    console.error("RENAME ERROR :", err);

    return message.reply(
        `❌ ${err.message}`
    );
}
    }
};
