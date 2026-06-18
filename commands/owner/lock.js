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
"1418370654251778168",
"1400111418358894646"
];

module.exports = {
name: "lock",

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
    const locked =
        perms?.deny.has(
            PermissionFlagsBits.SendMessages
        );
    if (locked) {
        await message.channel.permissionOverwrites.edit(
            everyone,
            {
                SendMessages: null
            }
        );
        return message.channel.send(
            "🔓 Salon déverrouillé."
        );
    }
    await message.channel.permissionOverwrites.edit(
        everyone,
        {
            SendMessages: false
        }
    );
    return message.channel.send(
        "🔒 Salon verrouillé."
    );
}

};
