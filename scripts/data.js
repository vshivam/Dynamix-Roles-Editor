var Data = {
  "scopesForRole": {
    "Guest": [
      "67ee8286-6ce9-4ee6-beb5-f475658c0293"
    ],
    "Family": [
      "a78bf682-8665-4691-93bf-f484ff7ebe02",
      "67ee8286-6ce9-4ee6-beb5-f475658c0293"
    ],
    "Admin": [
      "a78bf682-8665-4691-93bf-f484ff7ebe02",
      "67ee8286-6ce9-4ee6-beb5-f475658c0293"
    ]
  },
  "accessScopes": {
    "67ee8286-6ce9-4ee6-beb5-f475658c0293": {
      "accessProfiles": [{
        "name": "Kitchen Lights",
        "pluginId": "org.ambientdynamix.contextplugins.hueplugin",
        "deviceProfiles": {
          "Nirandika": [
            "SWITCH"
          ],
          "Max Lifx": [
            "SWITCH",
            "DISPLAY_COLOR"
          ]
        }
      }],
      "name": "Kitchen",
      "ID": "67ee8286-6ce9-4ee6-beb5-f475658c0293"
    },
    "a78bf682-8665-4691-93bf-f484ff7ebe02": {
      "accessProfiles": [{
        "name": "Changed profile",
        "pluginId": "org.ambientdynamix.contextplugins.hueplugin",
        "deviceProfiles": {
          "Max Lifx": [
            "SWITCH",
            "DISPLAY_COLOR"
          ]
        }
      }, {
        "name": "Bedroom media",
        "pluginId": "org.ambientdynamix.contextplugins.ambientmedia",
        "deviceProfiles": {
          "": [
            "DISPLAY_VIDEO",
            "PLAYBACK_PLAY_PAUSE",
            "PLAYBACK_FORWARD_SEEK",
            "PLAYBACK_BACKWARD_SEEK"
          ]
        }
      }],
      "name": "Bedroom",
      "ID": "a78bf682-8665-4691-93bf-f484ff7ebe02"
    }
  },
  "privileges": {
    "fancyKey": "Admin",
    "fancyKey3": "Family",
    "fancyKey2": "Guest"
  },
  "roles": [
    "Guest",
    "Family",
    "Admin"
  ]
};

var SharedData = {
  currentRoleName : null, 
  curentScope : null,
  currentScopeId : null
};