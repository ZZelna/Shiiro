const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const CustomRole = require("../models/CustomRole");

const LEGACY_CUSTOM_ROLES = {
    ascension: { role_id: "1520371005728755852", owner_id: "1293527746588442716" },
    yurin: { role_id: "1513249474330235081", owner_id: "1436025468133314687" },
    nebula: { role_id: "1511927847961493524", owner_id: "1497601791783735397" },
    mini: { role_id: "1507030170446594129", owner_id: "1386994361216274472" },
    zzelna: { role_id: "1507434325145288724", owner_id: "1418370654251778168" },
    sai: { role_id: "1510005066374054059", owner_id: "1245787697423974420" },
    kirito: { role_id: "1506813663950934057", owner_id: "1035241635937783848" },
    babe: { role_id: "1529205728638931045", owner_id: "1135944293148786768" },
    timal: { role_id: "1512913098930127019", owner_id: "1441136552842367027" },
    arsene: { role_id: "1509453660482961509", owner_id: "1335283306178281512" },
    hylia: { role_id: "1507085516950995014", owner_id: "908471501827764234" },
    fan2yusuke: { role_id: "1507813769798094848", owner_id: "1277800588578521146" },
    prodige: { role_id: "1508087663792488490", owner_id: "1395650564057989242" },
    boss: { role_id: "1509593333385924839", owner_id: "1436029525291962490" },
    florine: { role_id: "1507502397671342226", owner_id: "1507851969572765756" },
    yaci: { role_id: "1507890458703958126", owner_id: "779124269518946314" },
    lastrole: { role_id: "1514586336961499277", owner_id: "1064564135309877360" },
    tenshi: { role_id: "1516768576781025362", owner_id: "1046104492388646962" },
    paysans: { role_id: "1514721713055600810", owner_id: "1307161147203522570" },
    smx: { role_id: "1522800768439287948", owner_id: "1311321854161719389" },
    imperial: { role_id: "1514311309188006019", owner_id: "1010620278541402226" },
    rmxvy: { role_id: "1524795926282240031", owner_id: "1292848857704566866" },
    mel: { role_id: "1523697932191400106", owner_id: "1025841219030503577" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("migrate-custom-roles")
        .setDescription("[Admin] Importe les anciens rôles personnalisés vers MongoDB")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const migrated = [];
        const skipped = [];

        for (const [key, value] of Object.entries(LEGACY_CUSTOM_ROLES)) {

            const role = await interaction.guild.roles
                .fetch(value.role_id)
                .catch(() => null);

            if (!role) {
                skipped.push(`• ${key} (rôle introuvable)`);
                continue;
            }

            try {

                await CustomRole.findOneAndUpdate(
                    {
                        guildId: interaction.guild.id,
                        userId: value.owner_id
                    },
                    {
                        guildId: interaction.guild.id,
                        userId: value.owner_id,
                        roleId: role.id,
                        name: role.name,
                        color: role.hexColor,
                        icon: null,
                        commandName: key.toLowerCase(),
                        updatedAt: new Date()
                    },
                    {
                        upsert: true,
                        new: true,
                        runValidators: true,
                        setDefaultsOnInsert: true
                    }
                );

                migrated.push(`• ${key} → ${role.name}`);

            } catch (err) {

                skipped.push(`• ${key} (${err.message})`);

            }

        }

        const embed = new EmbedBuilder()
            .setColor(skipped.length ? "#F1C40F" : "#57F287")
            .setTitle("🔄 Migration des rôles personnalisés")
            .addFields(
                {
                    name: "✅ Migrés",
                    value: migrated.length
                        ? migrated.join("\n").slice(0, 1024)
                        : "Aucun",
                    inline: false
                },
                {
                    name: "⚠️ Ignorés / Erreurs",
                    value: skipped.length
                        ? skipped.join("\n").slice(0, 1024)
                        : "Aucune",
                    inline: false
                }
            )
            .setFooter({
                text: `Migration terminée • ${migrated.length} rôle(s) importé(s)`
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });

    }
};
