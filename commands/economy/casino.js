const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");
const QuizProfile = require("../../models/QuizProfile");
const { xpForLevel } = require("../../utils/quizEngine");

module.exports = {
    name: "casino",

    async run(message) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519055718416781412>."
            );
        }

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile) {
            return message.reply(
                "❌ Tu n'as pas encore créé ton profil casino."
            );
        }

        const embed = new EmbedBuilder()
            .setColor("#00BFFF")
            .setAuthor({
                name: `${message.author.username} • Profil Casino`,
                iconURL: message.author.displayAvatarURL()
            })
            .setThumbnail(
                message.author.displayAvatarURL()
            )
            .addFields(
                {
                    name: "💴 Yens",
                    value: `${profile.yens.toLocaleString()} ¥`,
                    inline: true
                },
                {
                    name: "🎁 Gifts",
                    value: `${profile.gifts.toLocaleString()}`,
                    inline: true
                }
            );

        // --- Ajout des stats de quiz, si le joueur a déjà un profil ---
        const quizProfile = await QuizProfile.findOne({
            userId: message.author.id,
            guildId: message.guild.id
        });

        if (quizProfile) {
            const xpAtLevel = xpForLevel(quizProfile.level);
            const xpNextLevel = xpForLevel(quizProfile.level + 1);
            const progress = quizProfile.xp - xpAtLevel;
            const span = xpNextLevel - xpAtLevel;
            const accuracy = quizProfile.questionsAnswered > 0
                ? Math.round((quizProfile.questionsCorrect / quizProfile.questionsAnswered) * 100)
                : 0;

            embed.addFields(
                {
                    name: "🧠 Niveau Quiz",
                    value: `${quizProfile.level}`,
                    inline: true
                },
                {
                    name: "⭐ XP",
                    value: `${progress}/${span} (${quizProfile.xp} total)`,
                    inline: true
                },
                {
                    name: "🔥 Streak",
                    value: `${quizProfile.streak} (meilleur : ${quizProfile.bestStreak})`,
                    inline: true
                },
                {
                    name: "📊 Bonnes réponses",
                    value: `${quizProfile.questionsCorrect}/${quizProfile.questionsAnswered} (${accuracy}%)`,
                    inline: true
                }
            );
        }

        embed
            .setFooter({
                text: "Shiiro Casino"
            })
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
