const allowedUsers = [
"1495920419528642631",
"1010620278541402226”,
"1421806026537173032”,
"1495834533797298176”,
"1500273343054614529”,
"1386994361216274472”,
"1277800588578521146”,
"1418370654251778168”
];

module.exports = {
name: “purge”,

async run(message, args) {
    if (!allowedUsers.includes(message.author.id)) {
        return message.reply(
            "❌ Vous n'avez pas la permission d'utiliser cette commande."
        );
    }
    const userId = args[0];
    if (!userId) {
        return message.reply(
            "❌ Utilisation : +purge ID"
        );
    }
    const messages = await message.channel.messages.fetch({
        limit: 100
    });
    const targetMessages = messages.filter(
        msg => msg.author.id === userId
    );
    if (targetMessages.size === 0) {
        return message.reply(
            "❌ Aucun message trouvé pour cet utilisateur."
        );
    }
    await message.channel.bulkDelete(
        targetMessages,
        true
    );
    const confirm = await message.channel.send(
        `🗑️ ${targetMessages.size} messages supprimés pour l'utilisateur ${userId}.`
    );
    setTimeout(() => {
        confirm.delete().catch(() => {});
    }, 3000);
}

};
