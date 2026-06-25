const Clan =
require("../models/Clan");

module.exports =
async function updateClanYens(
    userId,
    amount = 0
) {

    const clan =
        await Clan.findOne({
            members: userId
        });

    if (!clan) return;

    clan.totalYens += amount;
    clan.weeklyYens += amount;

    if (clan.totalYens < 0)
        clan.totalYens = 0;

    if (clan.weeklyYens < 0)
        clan.weeklyYens = 0;

    await clan.save();

};
