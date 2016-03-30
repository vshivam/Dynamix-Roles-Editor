 DynamixUtils = {

    getPairingCode : function(){
        function getUrlParameter(paramName) {
            var sPageURL = window.location.search.substring(1);
            if(sPageURL.slice(-1) == '/'){
                sPageURL = sPageURL.slice(0, -1);
            }
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == paramName) {
                    return sParameterName[1];
                }
            }
        }  

        var pairingCode = null;
        if(PairingUtils.pairingCode != ""){
            pairingCode = PairingUtils.pairingCode;
        }else {
            pairingCode = getUrlParameter('pairingCode');
        }
        return pairingCode;
    },

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
                    console.log("BIND_ERROR : " + status);
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

                                var pairingCode = that.getPairingCode();
                                handler.configuredContextRequest("GET", "org.ambientdynamix.contextplugins.guigeneration",  
                                    "org.ambientdynamix.contextplugins.guigeneration.accessprofiles", 
                                    {params : {ACCESS_TOKEN : pairingCode}, callback : configuredContextRequestCallback});
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
    }, 

    associateNewRole : function(roleName, type) {
        var handler = this.getContextHandler();
        var roleTokenString = (PairingUtils.generateRandomInt(100000000000, 999999999999)).toString();
        console.log("roleToken : " + roleTokenString);
        var configuredContextRequestCallback = function(status, result){
            switch(status){
                case Dynamix.Enums.SUCCESS:
                Data = JSON.parse(result.ACCESS_PROFILES);
                if(type == 'nfc'){
                    console.log('initiating role sharing via nfc');
                } else if(type == 'qr'){
                    PairingUtils.showRoleSharingBarcode(roleTokenString);
                }
                break;
            }
        };
        handler.configuredContextRequest("PUT", "org.ambientdynamix.contextplugins.guigeneration",  
                                    "org.ambientdynamix.contextplugins.guigeneration.accessprofiles",{
                                        params : {
                                            ACCESS_TOKEN : this.getPairingCode(), 
                                            OPERATION : "PRIVILEGE", 
                                            ROLE : roleName, 
                                            TOKEN : roleTokenString, 
                                            SHARE_TYPE : type
                                        }, 
                                        callback : configuredContextRequestCallback
                                    });
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
                        ACCESS_TOKEN : DynamixUtils.getPairingCode(), 
                        OPERATION : "UPDATE", 
                        DATA : JSON.stringify(Data)
                    },
                    callback : configuredContextRequestCallback
                });
        }
    }
};
