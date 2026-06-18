const allowedUsers = [
"1495920419528642631",
"1010620278541402226",
"1421806026537173032",
"1495834533797298176",
"1500273343054614529",
"1386994361216274472",
"1277800588578521146",
"1418370654251778168",
"1400111418358894646"
];

module.exports = {
name: "slowmode",

async run(message, args) {
    if (!allowedUsers.includes(message.author.id)) {
        return;
    }
    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        return message.reply(
            "❌ Utilisation : +slowmode [0-21600]"
        );
    }
    await message.channel.setRateLimitPerUser(
        seconds
    );
    if (seconds === 0) {
        return message.channel.send(
            "🚀 Slowmode retiré."
        );
    }
    return message.channel.send(
        `⏳ Slowmode défini à ${seconds} seconde(s).`
    );
}

};
