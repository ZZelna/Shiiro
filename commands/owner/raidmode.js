const fs = require("fs");
const path = require("path");
const {
ChannelType,
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

const raidFile = path.join(
__dirname,
"../../data/raidmode.json"
);

module.exports = {
name: “raidmode”,

async run(message) {
    if (!allowedUsers.includes(message.author.id)) {
        return;
    }
    let raidData = {
        enabled: false
    };
    if (fs.existsSync(raidFile)) {
        raidData = JSON.parse(
            fs.readFileSync(
                raidFile,
                "utf8"
            )
        );
    }
    const everyone =
        message.guild.roles.everyone;
    if (!raidData.enabled) {
        raidData.enabled = true;
        fs.writeFileSync(
            raidFile,
            JSON.stringify(
                raidData,
                null,
                4
            )
        );
        await everyone.setPermissions(
            everyone.permissions.remove(
                PermissionFlagsBits.CreateInstantInvite
            )
        );
        const channels =
            message.guild.channels.cache.filter(
                channel =>
                    channel.type ===
                    ChannelType.GuildText
            );
        for (const [, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(
                    everyone,
                    {
                        SendMessages: false
                    }
                );
                await channel.setRateLimitPerUser(
                    30
                );
            } catch {}
        }
        return message.channel.send(
            "🚨 RAID MODE ACTIVÉ\n\n" +
            "❌ Invitations désactivées\n" +
            "🔒 Tous les salons verrouillés\n" +
            "⏳ Slowmode 30 secondes activé"
        );
    }
    raidData.enabled = false;
    fs.writeFileSync(
        raidFile,
        JSON.stringify(
            raidData,
            null,
            4
        )
    );
    await everyone.setPermissions(
        everyone.permissions.add(
            PermissionFlagsBits.CreateInstantInvite
        )
    );
    const channels =
        message.guild.channels.cache.filter(
            channel =>
                channel.type ===
                ChannelType.GuildText
        );
    for (const [, channel] of channels) {
        try {
            await channel.permissionOverwrites.edit(
                everyone,
                {
                    SendMessages: null
                }
            );
            await channel.setRateLimitPerUser(
                0
            );
        } catch {}
    }
    return message.channel.send(
        "✅ RAID MODE DÉSACTIVÉ\n\n" +
        "🔗 Invitations réactivées\n" +
        "🔓 Salons déverrouillés\n" +
        "🚀 Slowmode retiré"
    );
}

};
