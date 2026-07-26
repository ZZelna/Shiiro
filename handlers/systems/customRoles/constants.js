const HEX_REGEX = /^#?[0-9A-Fa-f]{6}$/;

const COMMAND_REGEX = /^[a-z0-9_-]{2,20}$/;

const RESERVED_COMMANDS = [
    "help",
    "ping",
    "profile",
    "roles",
    "role",
    "customrole",
    "customroles",
    "create",
    "delete",
    "rename",
    "modify",
    "transfer",
    "share",
    "unshare",
    "list",
    "search",
    "stats",
    "repair",
    "export",
    "import"
];

module.exports = {
    HEX_REGEX,
    COMMAND_REGEX,
    RESERVED_COMMANDS
};
