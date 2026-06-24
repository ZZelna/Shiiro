const Clan = require("../models/Clan");
const CasinoProfile = require("../models/CasinoProfile");

module.exports = async (userId) => {

    const clan = await Clan.findOne({
        members: userId
    });

    if (!clan) return;

    const profiles =
        await CasinoProfile.find({
            userId: {
                $in: clan.members
            }
        });

    const total =
        profiles.reduce(
            (sum, profile) =>
                sum + (profile.yens || 0),
            0
        );

    clan.totalYens = total;

    await clan.save();
};
