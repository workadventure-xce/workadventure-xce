import type { Translation } from "../i18n-types";

const camera: NonNullable<Translation["camera"]> = {
    enable: {
        title: "Allumez votre caméra et votre microphone",
        start: "C'est parti!",
    },
    help: {
        title: "Accès à la caméra / au microphone nécessaire",
        permissionDenied: "Permission refusée",
        content: "Vous devez autoriser l'accès à la caméra et au microphone dans votre navigateur.",
        firefoxContent:
            'Veuillez cocher la case "Se souvenir de cette décision" si vous ne voulez pas que Firefox vous demande sans cesse l\'autorisation.',
        refresh: "Rafraîchir",
        continue: "Continuer sans webcam",
        screen: {
            firefox: "/resources/help-setting-camera-permission/fr-FR-chrome.png",
            chrome: "/resources/help-setting-camera-permission/fr-FR-chrome.png",
        },
    },
    my: {
        silentMode: "Moyen silencieuse",
        silentZone: "Zone silencieuse",
    },
    disabledInUserSettings:
        "Ta caméra est désactivée dans les paramètres du jeu. Est-ce que tu veux changer cela et activer ta caméra?",
    yes: "Oui",
    no: "Non",
};

export default camera;
