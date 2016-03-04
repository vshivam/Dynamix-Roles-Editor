$(document).on("pageinit", '#roles-page', function(){
	
	RoleUtils.loadDataIntoView();

	$('#addNewRoleForm').on('submit', function(e){
		var data = $("#addNewRoleForm :input").serializeArray();
		var roleName = data[0].value;
		RoleUtils.addNewRole(roleName);
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
	$('#scopes-header').remove();
	$('#scopes-list').empty();
	$('#scopes-select').empty();
});

$(document).on("pageshow","#scopes-page",function(){ 
	ScopeUtils.loadDataIntoView();
});
