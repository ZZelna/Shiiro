const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonStyle,
    MessageFlags
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const ALLOWED_ROLE = "1506674274826584284";

const SHOP_ITEMS = [
    {
        id: "role_perso",
        label: "👀 Rôle Perso",
        roleId: "1520898457580081233",
        price: 2000000,
        desc: "Crée ton propre rôle custom."
    },
    {
        id: "perm_pic",
        label: "🌆 Perm Photo",
        roleId: "1519633537156907088",
        price: 50000,
        desc: "voir la photo de profil de quelqu'un."
    },
    {
        id: "perm_banner",
        label: "🌃 Perm Bannière",
        roleId: "1519633572850438225",
        price: 50000,
        desc: "Bannière de profil."
    },
    {
        id: "perm_voc_chat",
        label: "🎙️ Perm Voc & Chat",
        roleId: "1519383713014878279",
        price: 50000,
        desc: "Envoyez des vocaux dans le chat."
    },
    {
        id: "deco_profil",
        label: "🎆 Déco Profil",
        roleId: "1519383383493312532",
        price: 15000000,
        desc: "Style unique sur ton profil."
    },
    {
        id: "nitro_boost",
        label: "🔮 Nitro Boost",
        roleId: "1519383355765035130",
        price: 20000000,
        desc: "Avantages Nitro Boost."
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Ouvre la boutique du serveur."),

    SHOP_ITEMS,

    async execute(interaction) {

        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (!member.roles.cache.has(ALLOWED_ROLE)) {
            return interaction.reply({
                content: "❌ Tu n'as pas accès à cette commande.",
                ephemeral: true
            });
        }

        const profile = await CasinoProfile.findOne({
            userId: interaction.user.id
        });

        if (!profile) {
            return interaction.reply({
                content: "❌ Tu n'as pas encore créé ton profil casino.",
                ephemeral: true
            });
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x0064c8)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 🏪 Boutique Shiiro")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `💴 **Ton solde :** \`${profile.yens.toLocaleString()} ¥\``
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );

        SHOP_ITEMS.forEach((item, index) => {

            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`**${item.label}**`),
                        new TextDisplayBuilder().setContent(
                            `${item.desc}\n**Prix :** \`${item.price.toLocaleString()} ¥\``
                        )
                    )
                    .setButtonAccessory(
                        button => button
                            .setCustomId(`shop_buy_${item.id}`)
                            .setLabel("Acheter")
                            .setStyle(ButtonStyle.Primary)
                    )
            );

            // Séparateur entre chaque article (sauf après le dernier)
            if (index < SHOP_ITEMS.length - 1) {
                container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                );
            }
        });

        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# Shiiro Casino • Boutique")
        );

        return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
