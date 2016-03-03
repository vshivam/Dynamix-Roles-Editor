Handlebars.getTemplate = function(name) {
	if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
	    $.ajax({
	        url : 'templates/' + name + '.handlebars',
	        success : function(data) {
	            if (Handlebars.templates === undefined) {
	                Handlebars.templates = {};
	            }
	            Handlebars.templates[name] = Handlebars.compile(data);
	        },
	        async : false
	    });
	}
	return Handlebars.templates[name];
};


var RoleUtils = {

	loadDataIntoView : function(){
		var that = this;
		var roleTemplate = Handlebars.getTemplate('roles-listitem');
		var roles = this.getRoles();

		$.each(roles, function(index, name){
			var html = that.getHtmlFromName(name);
			that.appendListItem(html);
		});


		$('#roles-list').on('click','a.edit-role', function(event){
			RoleUtils.openRoleEditor(event.target.id);
		});

		$('#roles-list').on('click', 'button.share-nfc', function(event){
			RoleUtils.shareViaNfc(event.target.id);
		});

		$('#roles-list').on('click', 'button.share-qr', function(event){
			RoleUtils.shareViaQRCode(event.target.id);
		});

	},

	openRoleEditor : function(name) {
		console.log("Opening Role Editor : " + name);
		SharedData["currentRole"] = name;
		console.log(SharedData);
		$.mobile.pageContainer.pagecontainer("change", "#scopes-page");
	},

	shareViaNfc : function(name) {
		console.log("Share via NFC : " + name);
	},

	shareViaQRCode : function(name) {
		console.log("Share Via QR Code : " + name);
	},

	addNewRole : function(name) {
		console.log("Sending request to add new role : " + name);
		Data.roles.push(name);
		var html = this.getHtmlFromName(name);
		this.appendListItem(html);
	},

	getRoles : function() {
		return Data.roles;
	}, 

	appendListItem : function(html) {
		$('#roles-list').append(html);
		$('#roles-list').listview();
		$('#roles-list').listview('refresh');
	}, 

	getHtmlFromName : function(name) {
		var roleTemplate = Handlebars.getTemplate('roles-listitem');
		var compiledHtml = roleTemplate(name);
		return compiledHtml;
	}
};

var ScopeUtils = {

	loadDataIntoView : function() {
		var that = this;
		var currentRole = SharedData["currentRole"];
		console.log(currentRole);
		var updateHeader = function(name) {
			// Add Header
			var scopesHeaderTemplate = Handlebars.getTemplate('scopes-page-header');
			var scopesHeaderCompiledHtml = scopesHeaderTemplate(name);
			$('#scopes-page').prepend(scopesHeaderCompiledHtml);
			$('#scopes-page').enhanceWithin();
		};

		updateHeader(currentRole);

		var scopes = Data.scopesForRole[currentRole];
		$.each(scopes, function(index, scopeId){
			var scope = Data.accessScopes[scopeId]["name"];
			that.addNewScope(scope);
		});
		
		$('#scopes-list').on('click', 'a.edit-scope', function(event){
			ScopeUtils.openScopeEditor(event.target.id);
		});


	},

	addNewScope : function(name) {
		var compiledHtml = this.getHtmlFromName(name);
		this.appendListItem(compiledHtml);
	},

	appendListItem : function(html) {
		$('#scopes-list').append(html).listview();
		$('#scopes-list').listview('refresh');
	},

	getHtmlFromName : function(name) {
		var scopesListTemplate = Handlebars.getTemplate('scopes-listitem');
		return scopesListTemplate(name);
	},

	openScopeEditor : function(name) {

		console.log('Open Scope Editor :' + name);

		var scopesForRole = {"Bedroom": ["5976ac8e-a288-4569-91f6-62d9291607d1",
		"f157754b-516d-4a13-9425-6ee139631b07"]};

		var accessScopes = {"accessScopes": {
			"f157754b-516d-4a13-9425-6ee139631b07": {
				"accessProfiles": [
				{
					"name": "Kitchen Lights",
					"pluginId": "org.ambientdynamix.contextplugins.hueplugin",
					"deviceId": "Nirandika",
					"commands": [
					"SWITCH"
					]
				}
				],
				"name": "Kitchen",
				"ID": "f157754b-516d-4a13-9425-6ee139631b07"
			},
			// One plugin has one access profile
			"5976ac8e-a288-4569-91f6-62d9291607d1": {
				"accessProfiles": [
				{
					"name": "Lighting",
					"pluginId": "org.ambientdynamix.contextplugins.hueplugin",
					"deviceId": "Max Lifx",
					"commands": [
					"SWITCH",
					"DISPLAY_COLOR"
					]
				},
				{
					"name": "Bedroom Media",
					"pluginId": "org.ambientdynamix.contextplugins.ambientmedia",
					"deviceId": "",
					"commands": [
					"DISPLAY_VIDEO",
					"PLAYBACK_PLAY_PAUSE",
					"PLAYBACK_FORWARD_SEEK",
					"PLAYBACK_BACKWARD_SEEK"
					]
				}
				],
				"name": "Bedroom",
				"ID": "5976ac8e-a288-4569-91f6-62d9291607d1"
			}
		}};

		var scopes = scopesForRole[name];
		$.each(scopes, function(index, value) {
			console.log(value);
		});
	},

	deleteScopeForRole : function(scope, role) {

	},

	editScope : function(scope){

	}
};