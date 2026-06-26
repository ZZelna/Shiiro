module.exports = {
    name: "clear",

    async run(message, args) {

        const allowedRole = "1506674274826584284";

        if (!message.member.roles.cache.has(allowedRole)) {
            return message.reply(
                "❌ Vous n'avez pas la permission."
            );
        }

        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
            return message.reply(
                "❌ Utilisation : +clear 1-100"
            );
        }

        await message.channel.bulkDelete(
            amount,
            true
        );

        const msg = await message.channel.send(
            `🗑️ ${amount} messages supprimés.`
        );

        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 3000);
    }
};
