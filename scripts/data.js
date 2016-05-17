
/**
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
     "accessProfiles": [
       {
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
       }
     ],
     "name": "Kitchen",
     "ID": "67ee8286-6ce9-4ee6-beb5-f475658c0293"
   },
   "a78bf682-8665-4691-93bf-f484ff7ebe02": {
     "accessProfiles": [
       {
         "name": "Changed profile",
         "pluginId": "org.ambientdynamix.contextplugins.hueplugin",
         "deviceProfiles": {
           "Max Lifx": [
             "SWITCH",
             "DISPLAY_COLOR"
           ]
         }
       },
       {
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
       }
     ],
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
**/
AmbientControlData = {
  "server_url" : "http://192.168.1.110:8080/ControlProfileServer-1.0.0/PluginControlDescription/ids/%s?format=json",
  "graph_url" : "http://192.168.1.110:8080/ControlProfileServer-1.0.0/ControlGraph?format=JSON",
  "plugin_ids" : ["org.ambientdynamix.contextplugins.ambientmedia",
                  "org.ambientdynamix.contextplugins.hueplugin",
                  "org.ambientdynamix.contextplugins.myoplugin",
                  "org.ambientdynamix.contextplugins.wemoplugin",
                  "org.ambientdynamix.contextplugins.spheronative",
                  "org.ambientdynamix.contextplugins.ardrone",
                  "org.ambientdynamix.contextplugins.pitchtracker",
                  "org.ambientdynamix.contextplugins.activityrecognition",
                  "org.ambientdynamix.contextplugins.ambienttwitternew",
                  "org.ambientdynamix.contextplugins.gamepadfeature",
                  "org.ambientdynamix.contextplugins.phonecontext"],

  "graphs" : [],

  load : function() {
    var that = this;
    $.each(that.plugin_ids, function(index, id){
      that.getCommandsFor(id);
    });

    $.ajax({
      url : that.graph_url, 
      success: function(data){
        data = JSON.parse(data);
        that.graphs = that.graphs.concat(data);
        console.log(that.graphs);
      }, 
      async : true, 
      cache : false
    });
  }, 

  /** if the commands have not been loaded from the server previously, 
  it'll be loaded when requested hence the callback **/
  getCommandsFor : function(pluginId, callback){
    var that = this;
    if (this.commandsMap === undefined || this.commandsMap[pluginId] === undefined) {
      var url = this.server_url.replace('%s', pluginId);
      $.ajax({
          url : url,
          success : function(data) {
            data = JSON.parse(data);
            console.log(data);
            var controls = [];

            if (that.commandsMap === undefined) {
                that.commandsMap = {};
            }

            $.each(data.inputList, function(index, input){
              controls = controls.concat(input.mandatoryControls);
            });

            if(data.optionalInputList != undefined){
              controls = controls.concat(data.optionalInputList);
            }

            var uniqueCommands = [];
            $.each(controls, function(i, el){
                if($.inArray(el, uniqueCommands) === -1) uniqueCommands.push(el);
            });

            that.commandsMap[pluginId] = uniqueCommands;

            if(callback !== undefined){
              callback(uniqueCommands);
            }
          },
          async : true, 
          cache: false
      });
    } else {
        if(callback != undefined) {
          console.log('Commands have been preloaded');
          callback(this.commandsMap[pluginId]);
        }
    }
  },

  getDevicesFor : function(pluginId){

    var devices = {
      "org.ambientdynamix.contextplugins.hueplugin" : ["Max Lifx", "Shivam"], 
      "org.ambientdynamix.contextplugins.wemoplugin" : ["WeMo Switch"], 
      "org.ambientdynamix.contextplugins.spheronative" : ["Sphero", "Ollie"], 
      "org.ambientdynamix.contextplugins.ambientmedia" : [""] // This is a hack since the Ambient Media plugin doesn't know how to handle device ids yet. 
    };

    return devices[pluginId];
  }
};

var SharedData = {
  currentRoleName : null, 
  curentScope : null,
  currentScopeId : null, 
  currentSceneName : null
};