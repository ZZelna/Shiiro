const {
PermissionFlagsBits
} = require("discord.js");

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

module.exports = {
name: "hide",

async run(message) {
    if (!allowedUsers.includes(message.author.id)) {
        return;
    }
    const everyone =
        message.guild.roles.everyone;
    const perms =
        message.channel.permissionOverwrites.cache.get(
            everyone.id
        );
    const hidden =
        perms?.deny.has(
            PermissionFlagsBits.ViewChannel
        );
    if (hidden) {
        await message.channel.permissionOverwrites.edit(
            everyone,
            {
                ViewChannel: null
            }
        );
        return message.channel.send(
            "👀 Salon affiché."
        );
    }
    await message.channel.permissionOverwrites.edit(
        everyone,
        {
            ViewChannel: false
        }
    );
    return message.channel.send(
        "🙈 Salon masqué."
    );
}

};
