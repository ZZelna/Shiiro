module.exports = {
    name: "perms",

    async run(message) {

        const embed = {
            color: 0x5865F2,

            title: "📜 Hiérarchie des Permissions Shiiro",

            description: `
## RAPPEL DES DIFFÉRENTS TYPES DE PERMS SUR SHIIRO

👑 **Fondateurs**

• <@&1506678023473201293> → Fondateurs
• <@&1507029804568936530> → Gérants Bots
• <@&1506723533806633062> → Réels Fondateurs du serveur
• <@&1506674274826584284> → Rôle défaut Fondateurs

━━━━━━━━━━━━━━

🛡️ **Gestion**

• <@&1506677194431397909> → Perm Superviseur
• <@&1506678650274058390> → Perm Manager
• <@&1506700079434567701> → Perm Supervision Staff
• <@&1506702770328178890> → Perm Gestion Abus
• <@&1506680477631905934> → Perm Gestion Staff

━━━━━━━━━━━━━━

⚙️ **Permissions Spéciales**

• <@&1507052585566077059> → Perms Attribuables
• <@&1507052481975161082> → Gestion Casino, Animation, Partenariats, Grab, TikTok

━━━━━━━━━━━━━━

🔑 **Permissions Techniques**

• <@&1507093456487579800> → Utilisation des Commandes
• <@&1508900825957797918> → Bannissements
• <@&1507824817859199088> → Ping des rôles
• <@&1506681475918205119> → Gestion des rôles
• <@&1506681188910104766> → Permissions Vocales
`,

            footer: {
                text: "Shiiro • Hiérarchie des permissions"
            },

            timestamp: new Date()
        };

        message.reply({
            embeds: [embed]
        });
    }
};
