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
});

/*

$(document).on("pageinit", '#scopes-page', function(){
	ScopeUtils.loadDataIntoView();
});

$(document).on("pageinit", '#devices-page', function(){

});
*/

$(document).on("pagebeforeshow","#scopes-page",function(){ 
	ScopeUtils.reset();
});

$(document).on("pageshow","#scopes-page",function(){ 
	ScopeUtils.loadDataIntoView();
});
