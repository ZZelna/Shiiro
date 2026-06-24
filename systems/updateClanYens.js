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

    if (clan.totalYens < 0)
        clan.totalYens = 0;

    await clan.save();

};
