function separator() {
    return "────────────────────────";
}

function user(user) {
    return `👤 Utilisateur : ${user.tag} (${user.id})`;
}

function member(member) {
    return `👤 Membre      : ${member.user.tag} (${member.id})`;
}

function guild(guild) {
    return `🏠 Serveur    : ${guild.name}`;
}

function channel(channel) {
    return `💬 Salon      : #${channel.name}`;
}

function role(role) {
    return `🎭 Rôle       : ${role.name} (${role.id})`;
}

function build(title, lines = []) {
    return [
        `~ ${title}.`,
        "",
        ...lines,
        "",
        separator()
    ].join("\n");
}

module.exports = {
    build,
    separator,
    user,
    member,
    guild,
    channel,
    role
};
