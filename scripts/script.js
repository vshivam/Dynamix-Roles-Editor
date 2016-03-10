$(document).on("pageinit", '#roles-page', function(){
	
	RoleUtils.loadDataIntoView();

	/*** Form Submission Listeners ***/
	$('#addNewRoleForm').on('submit', function(e){
		var data = $("#addNewRoleForm :input").serializeArray();
		var roleName = data[0].value;
		RoleUtils.addNewRole(roleName);
	});

	$('#addExistingScopeForm').on('submit', function(e){
		e.preventDefault();
		var id = $('#scopes-select').val();
		var name = $('#scopes-select option:selected').data("name");
 		ScopeUtils.addNewScope(name, id);
 		ScopeUtils.refreshAddNewScopesPopup();
	});

	$('#addNewScopeForm').on('submit', function(e){
		e.preventDefault();
		var data = $("#addNewScopeForm :input").serializeArray();
		var scopename = data[0].value;
 		ScopeUtils.addNewScope(scopename);
 		ScopeUtils.refreshAddNewScopesPopup();
	});

	$('#addAccessControlForm').on('submit', function(e){
		e.preventDefault();
		var data = $("#addAccessControlForm :input").serializeArray();
		var id = $('#plugin-id-select option:selected').data('pluginid');
		var accessControlName = data[0].value;
		var plugin = {'pluginId' : id, 'name' : accessControlName};
 		DeviceUtils.addNewPluginListitem(plugin);
 		var scope = DeviceUtils.getScope();
 		console.log(scope["accessProfiles"]);
 		var accessProfile = {name : accessControlName, pluginId : pluginId, deviceProfiles : {}};
 		scope["accessProfiles"].push(accessProfile);
 		console.log(scope["accessProfiles"]);
 		$('#addAccessControlPopup').popup('close');
	});

	/*** Page change Listeners ***/
	$(document).on("pageshow","#scopes-page",function(event){ 
		console.log("pageshow scopes page");
		ScopeUtils.loadDataIntoView();
	});

	$(document).on("pageshow","#devices-page",function(event){ 
		console.log("pageshow devices page");
		DeviceUtils.loadDataIntoView();
	});


	$('#plugins-list').on('click', 'button.add-new-device', function(){
			var pluginId = $(this).closest('li.plugin-listitem').data('pluginid');
			console.log(pluginId);
			DeviceUtils.showAddNewDevicePopup(pluginId);
	});

	$('#plugins-list').on('click', 'button.revoke-access', function(){
			var parentCollapsible = $(this).closest('li.plugin-listitem');
			var pluginId = parentCollapsible.data('pluginid');
			parentCollapsible.remove();
			that.revokeFullAccess(pluginId);
	});
});

