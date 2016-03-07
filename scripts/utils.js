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
	        async : false, 
	        cache: false
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
		SharedData.currentRoleName = name;
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
		Data["scopesForRole"][name] = [];
		var html = this.getHtmlFromName(name);
		this.appendListItem(html);
	},

	getRoles : function() {
		return Data.roles;
	}, 

	appendListItem : function(html) {
		$('#roles-list').append(html);
		$('#roles-list').listview();
		$('#roles-list').listview('refresh', true);
	}, 

	getHtmlFromName : function(name) {
		var roleTemplate = Handlebars.getTemplate('roles-listitem');
		var compiledHtml = roleTemplate(name);
		return compiledHtml;
	}
};

var ScopeUtils = {

	reset : function() {
		$('#scopes-header').remove();
		$('#scopes-list').empty();
	}, 

	loadDataIntoView : function() {
		var currentRoleName = SharedData["currentRoleName"];
		
		/*** Clear pre existing html from the page ***/
		this.reset();

		/*** Update html data ***/
		this.updateHeader(currentRoleName);
		this.updateScopesList(currentRoleName);
		this.refreshAddNewScopesPopup();
	},

	updateHeader : function(name) {
		var scopesHeaderTemplate = Handlebars.getTemplate('scopes-page-header');
		var scopesHeaderCompiledHtml = scopesHeaderTemplate(name);
		$('#scopes-page').prepend(scopesHeaderCompiledHtml);
		$('#scopes-page').enhanceWithin();
	},

	updateScopesList : function(currentRoleName) {
		var that = this;
		var scopes = Data.scopesForRole[currentRoleName];

		$.each(scopes, function(index, scopeId){
			var scopeName = Data.accessScopes[scopeId]["name"];
			that.addNewScope(scopeName, scopeId);
		});
		
		$('#scopes-list').on('click', 'a.edit-scope', function(event){
			that.openScopeEditor($(this).data('id'));
		});

		$('#scopes-list').on('click', 'a.delete-scope', function(event){
			that.deleteScopeFromRole($(this).data('id'), currentRoleName);
		});
	},

	refreshAddNewScopesPopup : function() {
		$('#scopes-select').empty();
		/*** Adding data to add new scope dialog ***/
		var currentRoleName = SharedData["currentRoleName"];
		var scopes = Data.scopesForRole[currentRoleName];
		var addExistingScopeListitemTemplate = Handlebars.getTemplate('add-existing-scope-listitem');
		for(var key in Data.accessScopes) {
			//Only show scopes which don't already exist for this role
			if(Data.accessScopes.hasOwnProperty(key) && scopes.indexOf(key) == -1) {
				var accessScope = Data.accessScopes[key];
				var html = addExistingScopeListitemTemplate(accessScope)
				$('#scopes-select').append(html);
			}
		}
		$('#scopes-select').selectmenu('refresh');
	},

	addNewScope : function(name, id) {
		var currentRoleName = SharedData["currentRoleName"];
		console.log(id);
		if(id == undefined) {
			/*** This is a new scope that doesn't pre exist, so create new id ***/
			id = this.guid();
			Data["accessScopes"][id] = {"accessProfiles" : [],
							"ID" : id, 
							"name": name};
			console.log("Creating new scope with id : " + id);
		}
		var compiledHtml = this.getHtmlFromNameAndId(name, id);
		this.appendListItem(compiledHtml);
		Data["scopesForRole"][currentRoleName].push(id);
	},

	appendListItem : function(html) {
		$('#scopes-list').append(html).listview();
		$('#scopes-list').listview('refresh');
	},

	getHtmlFromNameAndId : function(name, id) {
		var scope = {'name':name, 'id':id};
		var scopesListTemplate = Handlebars.getTemplate('scopes-listitem');
		return scopesListTemplate({scope : scope});
	},

	openScopeEditor : function(id) {
		console.log('Open Scope Editor : ' + id);
		SharedData.currentScopeId = id;
		$.mobile.pageContainer.pagecontainer("change", "#devices-page");
	},

	deleteScopeFromRole : function(scope, role) {
		console.log('Delete ' + scope + ' from role :' + role);
		var listOfScopes = Data["scopesForRole"][role];
		var index = listOfScopes.indexOf(scope);
		var result = Data["scopesForRole"][role].splice(index, 1);
		$('li.scopes-listitem#'+scope).remove();
		this.refreshAddNewScopesPopup();
	}, 

	guid : function() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	}
};

DeviceUtils = {

	loadDataIntoView : function() {

	}


};
