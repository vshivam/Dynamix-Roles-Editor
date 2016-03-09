$(document).on("pageinit", '#roles-page', function(){
	
	RoleUtils.loadDataIntoView();

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
 		$('#addAccessControlPopup').popup('close');
	});

/*
	$(document).one("pagebeforeshow","#scopes-page",function(event){ 
		console.log("pagebeforeshow scopes page");
		ScopeUtils.reset();
	});
*/
	$(document).one("pageshow","#scopes-page",function(event){ 
		console.log("pageshow scopes page");
		ScopeUtils.loadDataIntoView();
	});
/*
	$(document).on("pagebeforeshow","#devices-page",function(event){ 
		console.log("pagebeforeshow devices page");
		DeviceUtils.reset();
	});
*/
	$(document).one("pageshow","#devices-page",function(event){ 
		console.log("pageshow devices page");
		DeviceUtils.loadDataIntoView();
	});
});

