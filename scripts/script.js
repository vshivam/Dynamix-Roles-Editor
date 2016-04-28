$(document).on("pageinit", '#roles-page', function(){

	AmbientControlData.load();
	
	/*** Form Submission Listeners ***/
	$('#addNewRoleForm').on('submit', function(e){
		e.preventDefault();
		var data = $("#addNewRoleForm :input").serializeArray();
		var roleName = data[0].value;
		RoleUtils.addNewRole(roleName);
		$('#addNewRolePopup').popup('close');
		Db.updateAll();
	});

	$('#addExistingScopeForm').on('submit', function(e){
		e.preventDefault();
		var id = $('#scopes-select').val();
		var name = $('#scopes-select option:selected').data("name");
 		ScopeUtils.addNewScope(name, id);
 		ScopeUtils.refreshAddNewScopesPopup();
		$('#addScopePopup').popup('close');
		Db.updateAll();
	});

	$('#addNewScopeForm').on('submit', function(e){
		e.preventDefault();
		var data = $("#addNewScopeForm :input").serializeArray();
		var scopename = data[0].value;
		console.log('Submitting add new scope form data : ' + scopename);
 		ScopeUtils.addNewScope(scopename);
 		ScopeUtils.refreshAddNewScopesPopup();
 		$('#addScopePopup').popup('close');
 		Db.updateAll();
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
 		var accessProfile = {name : accessControlName, pluginId : id, deviceProfiles : {}};
 		scope["accessProfiles"].push(accessProfile);
 		console.log(scope["accessProfiles"]);
 		$('#addAccessControlPopup').popup('close');
 		Db.updateAll();

	});

	$('#addNewGraphForm').on('submit', function(e){
		e.preventDefault();
		var graphName = $('#graph-id-select option:selected').data('name');
		$('#current-graph-name').text(graphName);
		var scope = DeviceUtils.getScope();
		scope["sceneGraphs"] = "graphName";
 		$('#addNewGraphPopup').popup('close');
 		Db.updateAll();
	});

	$('#addNewSceneForm').on('submit', function(e){
		e.preventDefault();
		var sceneName = $('input#scene-name').val();
		console.log(sceneName);
		DeviceUtils.scene.octopus.addScene(sceneName);
 		$('#addNewScenePopup').popup('close');
 		Db.updateAll();
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
		DeviceUtils.revokeFullAccess(pluginId);
		Db.updateAll();
	});

	DynamixUtils.bindDynamix();
});

