module.exports = {

    name: "casino",

    displayName: "Casino",

    icon: "🎰",

    description: "Configuration du casino",

    categories: [

        {
            id: "channels",
            name: "Salons",
            emoji: "📂",

            settings: [

                {
                    id: "main",
                    label: "Salon principal",
                    type: "channel"
                },

                {
                    id: "logs",
                    label: "Salon des logs",
                    type: "channel"
                },

                {
                    id: "shop",
                    label: "Boutique",
                    type: "channel"
                }

            ]

        },

        {
            id: "roles",
            name: "Rôles",
            emoji: "👥",

            settings: [

                {
                    id: "admin",
                    label: "Casino Admin",
                    type: "role"
                },

                {
                    id: "staff",
                    label: "Casino Staff",
                    type: "role"
                }

            ]

        },

        {
            id: "settings",
            name: "Variables",
            emoji: "⚙️",

            settings: [

                {
                    id: "currency",
                    label: "Devise",
                    type: "string",
                    default: "¥"
                },

                {
                    id: "cooldown",
                    label: "Cooldown",
                    type: "number",
                    default: 60
                },

                {
                    id: "enabled",
                    label: "Plugin activé",
                    type: "boolean",
                    default: true
                }

            ]

        }

    ]

};
