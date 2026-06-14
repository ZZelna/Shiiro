module.exports = {
    name: "clear",

    async run(message, args) {

        const allowedUsers = [
            "1495920419528642631",
            "1010620278541402226",
            "1421806026537173032",
            "1495834533797298176",
            "1500273343054614529",
            "1386994361216274472",
            "1277800588578521146",
            "1418370654251778168"
        ];

        if (!allowedUsers.includes(message.author.id)) {
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
