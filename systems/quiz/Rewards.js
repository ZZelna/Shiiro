const QuizProfile = require("../../models/QuizProfile");

async function addXP(userId, amount) {

    let profile = await QuizProfile.findOne({ userId });

    if (!profile) {
        profile = await QuizProfile.create({ userId });
    }

    profile.xp += amount;

    let leveledUp = false;

    while (profile.xp >= profile.level * 100) {

        profile.xp -= profile.level * 100;
        profile.level++;

        leveledUp = true;

    }

    await profile.save();

    return {
        level: profile.level,
        xp: profile.xp,
        leveledUp
    };

}

module.exports = {
    addXP
};
