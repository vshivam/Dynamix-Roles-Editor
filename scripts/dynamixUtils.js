 DynamixUtils = {

    getContextHandler : function() {
        return this.contextHandler;
    }, 

    bindDynamix : function() {
        var that = this;
        var bindListener = function (status) {
            switch (status) {
                case Dynamix.Enums.BOUND :
                    console.log("Woohoo! We're bound!");
                    that.openDynamixSession();
                    break;
                case Dynamix.Enums.BIND_ERROR :
                    Dynamix.bind(bindListener)
                    break;
                case Dynamix.Enums.UNBOUND :
                    break;
            }
        };
        Dynamix.bind(bindListener);
    }, 

    openDynamixSession : function() {
        var that = this;

        var openSessionCallback = function (status) {
            console.log("OpenSessionCallback : " + status);
            switch (status) {
                case Dynamix.Enums.SUCCESS :
                    that.createContextHandler();
                    break;
            }
        };     
        
        var sessionListener = function (status, result) {
            console.log("Session Listener : " + status);
            switch (status) {
                case Dynamix.Enums.SESSION_OPENED :
                    console.log(result);
                    break;
                case Dynamix.Enums.SESSION_CLOSED :
                    break;
                case Dynamix.Enums.PLUGIN_UNINSTALLED :
                    console.log(result);
                    break;
                case Dynamix.Enums.PLUGIN_INSTALLED :
                    console.log(result);
                    break;
                case Dynamix.Enums.PLUGIN_ENABLED :
                    console.log(result);
                    break;
                case Dynamix.Enums.PLUGIN_DISABLED :
                    console.log(result);
                    break;
                case Dynamix.Enums.PLUGIN_ERROR :
                    console.log("Error Message : " + result.message);
                    console.log("Plugin name : " + result.plugin.pluginName);
                    console.log("Error Code : " + result.errorCode);
                    break;
            }
        };   

        Dynamix.openDynamixSession({listener: sessionListener, callback: openSessionCallback});
    }, 

    createContextHandler : function () {
        var that = this;
        var createNewHandlerCallback = function (status, handler) {
            switch (status) {
                case Dynamix.Enums.SUCCESS :
                    that.contextHandler = handler;

                    var contextSupportCallback = function(status, result){
                        switch (status) {
                            case Dynamix.Enums.SUCCESS :
                                console.log("Context support approved for org.ambientdynamix.contextplugins.guigeneration");
                                var configuredContextRequestCallback = function(status, result) {
                                    switch(status){
                                        case Dynamix.Enums.SUCCESS:
                                            Data = JSON.parse(result.ACCESS_PROFILES);
                                            RoleUtils.loadDataIntoView();
                                        break;
                                    }
                                };

                                handler.configuredContextRequest("GET", "org.ambientdynamix.contextplugins.guigeneration",  
                                    "org.ambientdynamix.contextplugins.guigeneration.accessprofiles", 
                                    {params : {ACCESS_TOKEN : "ADMIN"}, callback : configuredContextRequestCallback});
                                break;
                            case Dynamix.Enums.FAILURE:
                                console.log("Context support was not approved for org.ambientdynamix.contextplugins.guigeneration");
                                break;
                        }
                    };

                    handler.addContextSupport('org.ambientdynamix.contextplugins.guigeneration', 
                        'org.ambientdynamix.contextplugins.guigeneration.accessprofiles', 
                        {callback : contextSupportCallback});
                    break;
            }
        };
        Dynamix.createContextHandler(createNewHandlerCallback);
    }    
};

Db = {
    updateAll : function() {
        var handler = DynamixUtils.getContextHandler();
        if(handler !== undefined) {
            var configuredContextRequestCallback = function(status, result) {
                switch(status){
                    case Dynamix.Enums.SUCCESS:
                        console.log("Seccessfully saved data to Db");
                        console.log(JSON.parse(result.ACCESS_PROFILES));
                        break;
                }
            };

            handler.configuredContextRequest("PUT", "org.ambientdynamix.contextplugins.guigeneration",  
                "org.ambientdynamix.contextplugins.guigeneration.accessprofiles", {
                    params : {
                        ACCESS_TOKEN : "ADMIN", 
                        OPERATION : "UPDATE", 
                        DATA : JSON.stringify(Data)
                    },
                    callback : configuredContextRequestCallback
                });
        }
    }
};
