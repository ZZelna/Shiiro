const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const { checkGameChannel } = require("../utils/guards/gameChannelGuard");

//──────────────────────────────────────
// Configuration
//──────────────────────────────────────

const DAILY_LIMIT = 500000;
const MAX_BET = 25000;

const COLORS = {
    Blue: 0x3498DB,
    Green: 0x57F287,
    Red: 0xED4245,
    Gold: 0xFFD700,
    Yellow: 0xFEE75C
};

//──────────────────────────────────────
// Cartes
//──────────────────────────────────────

const SUITS = [
    "♠",
    "♥",
    "♦",
    "♣"
];

const VALUES = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A"
];

//──────────────────────────────────────
// Création du sabot
//──────────────────────────────────────

function buildDeck() {

    const deck = [];

    for (let d = 0; d < 6; d++) {

        for (const suit of SUITS) {

            for (const value of VALUES) {

                deck.push({
                    suit,
                    value
                });

            }

        }

    }

    shuffle(deck);

    return deck;

}

//──────────────────────────────────────
// Mélange Fisher-Yates
//──────────────────────────────────────

function shuffle(deck) {

    for (let i = deck.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [
            deck[i],
            deck[j]
        ] = [
            deck[j],
            deck[i]
        ];

    }

}

//──────────────────────────────────────
// Sabot partagé
//──────────────────────────────────────

let shoe = buildDeck();

function drawCard() {

    if (shoe.length < 80) {

        shoe = buildDeck();

    }

    return shoe.pop();

}

//──────────────────────────────────────
// Valeur des cartes
//──────────────────────────────────────

function getCardValue(card) {

    if (["J", "Q", "K"].includes(card.value))
        return 10;

    if (card.value === "A")
        return 11;

    return Number(card.value);

}

function getHandValue(hand) {

    let total = hand.reduce(
        (sum, card) => sum + getCardValue(card),
        0
    );

    let aces = hand.filter(
        c => c.value === "A"
    ).length;

    while (total > 21 && aces > 0) {

        total -= 10;
        aces--;

    }

    return total;

}

//──────────────────────────────────────
// Affichage des cartes
//──────────────────────────────────────

function handToString(hand) {

    return hand
        .map(card => `${card.value}${card.suit}`)
        .join("  ");

}
//──────────────────────────────────────
// Container Discord
//──────────────────────────────────────

function buildContainer(
    color,
    title,
    description,
    row = null
) {

    const container =
        new ContainerBuilder()
            .setAccentColor(color)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🃏 ${title}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(description)
            );

    if (row) {

        container.addActionRowComponents(row);

    }

    return container;

}

//──────────────────────────────────────
// Boutons
//──────────────────────────────────────

function buildButtons({
    canDouble = false,
    canSplit = false,
    canInsurance = false
}) {

    const row =
        new ActionRowBuilder();

    row.addComponents(

        new ButtonBuilder()
            .setCustomId("hit")
            .setLabel("🃏 Tirer")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("stand")
            .setLabel("✋ Rester")
            .setStyle(ButtonStyle.Secondary)

    );

    if (canDouble) {

        row.addComponents(

            new ButtonBuilder()
                .setCustomId("double")
                .setLabel("💎 Doubler")
                .setStyle(ButtonStyle.Success)

        );

    }

    if (canSplit) {

        row.addComponents(

            new ButtonBuilder()
                .setCustomId("split")
                .setLabel("✂️ Split")
                .setStyle(ButtonStyle.Primary)

        );

    }

    if (canInsurance) {

        row.addComponents(

            new ButtonBuilder()
                .setCustomId("insurance")
                .setLabel("🛡️ Assurance")
                .setStyle(ButtonStyle.Secondary)

        );

    }

    return row;

}

//──────────────────────────────────────
// Export de la commande
//──────────────────────────────────────

module.exports = {

    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Joue au Blackjack contre le casino.")
        .addIntegerOption(option =>
            option
                .setName("mise")
                .setDescription("Montant à miser")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(MAX_BET)
        ),

    async execute(interaction) {

        if (!(await checkGameChannel(interaction))) return;

        const bet =
            interaction.options.getInteger("mise");

        const user =
            await CasinoProfile.findOne({
                userId: interaction.user.id
            });

        if (!user) {

            return interaction.reply({
                content:
                    "❌ Tu n'as pas encore créé ton profil casino.",
                ephemeral: true
            });

        }

        if (user.yens < bet) {

            return interaction.reply({
                content:
                    `❌ Tu ne possèdes que **${user.yens.toLocaleString()} Yens**.`,
                ephemeral: true
            });

        }
                //──────────────────────────────────────
        // Réinitialisation journalière
        //──────────────────────────────────────

        const now = new Date();

        const lastDaily = user.lastDaily
            ? new Date(user.lastDaily)
            : null;

        const sameDay =
            lastDaily &&
            lastDaily.getDate() === now.getDate() &&
            lastDaily.getMonth() === now.getMonth() &&
            lastDaily.getFullYear() === now.getFullYear();

        if (!sameDay) {

            user.lastDaily = now;
            user.dailyBet = 0;

        }

        const alreadyBet =
            user.dailyBet ?? 0;

        if (alreadyBet + bet > DAILY_LIMIT) {

            return interaction.reply({

                content:
                    `❌ Tu as atteint la limite journalière.\n\n` +
                    `Il te reste **${(DAILY_LIMIT - alreadyBet).toLocaleString()} Yens** à miser aujourd'hui.`,

                ephemeral: true

            });

        }

        //──────────────────────────────────────
        // Distribution des cartes
        //──────────────────────────────────────

        let currentBet = bet;

        const playerHand = [
            drawCard(),
            drawCard()
        ];

        const dealerHand = [
            drawCard(),
            drawCard()
        ];

        const playerValue =
            getHandValue(playerHand);

        //──────────────────────────────────────
        // Blackjack naturel
        //──────────────────────────────────────

        if (
            playerValue === 21 &&
            playerHand.length === 2
        ) {

            const gain =
                Math.floor(currentBet * 1.5);

            user.yens += gain;
            user.dailyBet =
                alreadyBet + currentBet;

            await user.save();

            return interaction.reply({

                components: [

                    buildContainer(

                        COLORS.Gold,

                        "Blackjack !",

                        `🧑 Ta main : ${handToString(playerHand)} — **21**\n\n` +
                        `🎉 Blackjack naturel !\n` +
                        `Tu remportes **${gain.toLocaleString()} Yens**.\n\n` +
                        `💴 Solde : **${user.yens.toLocaleString()} Yens**`

                    )

                ],

                flags: MessageFlags.IsComponentsV2

            });

        }

        //──────────────────────────────────────
        // Boutons disponibles
        //──────────────────────────────────────

        const canDouble =
            user.yens >= currentBet * 2;

        const canSplit =
            playerHand[0].value ===
            playerHand[1].value;

        const canInsurance =
            dealerHand[0].value === "A";

        const buttons = buildButtons({

            canDouble,
            canSplit,
            canInsurance

        });

        const message =
            await interaction.reply({

                components: [

                    buildContainer(

                        COLORS.Blue,

                        "Blackjack",

                        `🧑 Ta main : ${handToString(playerHand)} — **${playerValue}**\n` +
                        `🏦 Dealer : ${dealerHand[0].value}${dealerHand[0].suit} ❓\n\n` +
                        `💴 Mise : **${currentBet.toLocaleString()} Yens**`,

                        buttons

                    )

                ],

                flags:
                    MessageFlags.IsComponentsV2,

                fetchReply: true

            });

        const collector =
            message.createMessageComponentCollector({

                filter:
                    i =>
                        i.user.id ===
                        interaction.user.id,

                time: 60000

            });
        //──────────────────────────────────────
        // Gestion des boutons
        //──────────────────────────────────────

        collector.on("collect", async i => {

            //──────────────
            // Tirer
            //──────────────

            if (i.customId === "hit") {

                playerHand.push(drawCard());

                const value = getHandValue(playerHand);

                if (value > 21) {

                    collector.stop("bust");

                    user.yens -= currentBet;
                    user.dailyBet = alreadyBet + currentBet;

                    await user.save();

                    return i.update({

                        components: [

                            buildContainer(

                                COLORS.Red,

                                "Bust !",

                                `🧑 Ta main : ${handToString(playerHand)} — **${value}**\n\n` +
                                `❌ Tu dépasses 21.\n` +
                                `Tu perds **${currentBet.toLocaleString()} Yens**.\n\n` +
                                `💴 Solde : **${user.yens.toLocaleString()} Yens**`

                            )

                        ],

                        flags: MessageFlags.IsComponentsV2

                    });

                }

                return i.update({

                    components: [

                        buildContainer(

                            COLORS.Blue,

                            "Blackjack",

                            `🧑 Ta main : ${handToString(playerHand)} — **${value}**\n` +
                            `🏦 Dealer : ${dealerHand[0].value}${dealerHand[0].suit} ❓\n\n` +
                            `💴 Mise : **${currentBet.toLocaleString()} Yens**`,

                            buildButtons({
                                canDouble: false,
                                canSplit: false,
                                canInsurance: false
                            })

                        )

                    ],

                    flags: MessageFlags.IsComponentsV2

                });

            }

            //──────────────
            // Rester
            //──────────────

            if (i.customId === "stand") {

                collector.stop("stand");

                return resolveGame(
                    i,
                    playerHand,
                    dealerHand,
                    currentBet,
                    user,
                    alreadyBet
                );

            }

            //──────────────
            // Doubler
            //──────────────

            if (i.customId === "double") {

                if (user.yens < currentBet * 2) {

                    return i.reply({
                        content: "❌ Tu n'as pas assez de Yens pour doubler.",
                        ephemeral: true
                    });

                }

                currentBet *= 2;

                playerHand.push(drawCard());

                collector.stop("double");

                return resolveGame(
                    i,
                    playerHand,
                    dealerHand,
                    currentBet,
                    user,
                    alreadyBet
                );

            }

            //──────────────
            // Assurance (V2)
            //──────────────

            if (i.customId === "insurance") {

                return i.reply({

                    content:
                        "🛡️ L'assurance sera disponible dans la prochaine mise à jour.",

                    ephemeral: true

                });

            }

            //──────────────
            // Split (V2)
            //──────────────

            if (i.customId === "split") {

                return i.reply({

                    content:
                        "✂️ Le Split arrivera dans la prochaine mise à jour.",

                    ephemeral: true

                });

            }

        });

    }

};

//──────────────────────────────────────
// Résolution de la partie
//──────────────────────────────────────

async function resolveGame(
    interaction,
    playerHand,
    dealerHand,
    currentBet,
    user,
    alreadyBet
) {

    // Le dealer joue intelligemment
    while (getHandValue(dealerHand) < 17) {

        dealerHand.push(drawCard());

    }

    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);

    let color;
    let title;
    let result;

    //──────────────────────────────────
    // Victoire du joueur
    //──────────────────────────────────

    if (
        dealerValue > 21 ||
        playerValue > dealerValue
    ) {

        user.yens += currentBet;

        color = COLORS.Green;
        title = "Victoire";

        result =
            `🎉 Tu remportes **${currentBet.toLocaleString()} Yens** !`;

    }

    //──────────────────────────────────
    // Egalité
    //──────────────────────────────────

    else if (
        playerValue === dealerValue
    ) {

        color = COLORS.Yellow;
        title = "Égalité";

        result =
            "🤝 Personne ne gagne cette manche.";

    }

    //──────────────────────────────────
    // Défaite
    //──────────────────────────────────

    else {

        user.yens -= currentBet;

        color = COLORS.Red;
        title = "Défaite";

        result =
            `❌ Tu perds **${currentBet.toLocaleString()} Yens**.`;

    }

    user.dailyBet =
        alreadyBet + currentBet;

    await user.save();

    await interaction.update({

        components: [

            buildContainer(

                color,

                title,

                `🧑 Ta main : ${handToString(playerHand)} — **${playerValue}**\n` +
                `🏦 Dealer : ${handToString(dealerHand)} — **${dealerValue}**\n\n` +
                `${result}\n\n` +
                `💴 Solde : **${user.yens.toLocaleString()} Yens**`

            )

        ],

        flags: MessageFlags.IsComponentsV2

    });

}
