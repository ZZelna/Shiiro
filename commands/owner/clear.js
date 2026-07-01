module.exports = {
    name: "clear",

    async run(message, args) {

        const allowedRoles = [
            "1506674274826584284",
            "1521596407968960613"
        ];

        if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
            return message.reply("❌ Vous n'avez pas la permission.");
        }

        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
            return message.reply("❌ Utilisation : +clear <1-100>");
        }

        await message.channel.bulkDelete(amount, true);

        const msg = await message.channel.send(
            `🗑️ ${amount} messages supprimés.`
        );

        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 3000);
    }
};
