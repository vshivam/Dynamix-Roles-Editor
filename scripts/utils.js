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

		this.appendListItem('<li data-role="list-divider"> Current Dashboards </li>');

		$.each(roles, function(index, name){
			if(name!='Admin'){
				var html = that.getHtmlFromName(name);
				that.appendListItem(html);					
			}

		});

		$('#roles-list').on('click','a.edit-menu', function(e){
			e.preventDefault();
			var editRolePopup = $('#editRolePopup');
			editRolePopup.popup("open");
			var roleName = $(this).attr('id');
			$('a#edit-role').one('click', function(e){
				that.openRoleEditor(roleName);
			});
			$('a#delete-role').one('click', function(e){
				that.deleteRole(roleName);
			});
		});

		$('#roles-list').on('click', 'button.share-nfc', function(e){
			e.preventDefault();
			RoleUtils.shareViaNfc(e.target.id);
		});

		$('#roles-list').on('click', 'button.share-qr', function(e){
			e.preventDefault();
			RoleUtils.shareViaQRCode(e.target.id);
		});

	},

	openRoleEditor : function(name) {
		console.log("Opening Role Editor : " + name);
		SharedData.currentRoleName = name;
		$.mobile.pageContainer.pagecontainer("change", "#scopes-page");
		ScopeUtils.reset();
	},

	shareViaNfc : function(name) {
		console.log("Share via NFC : " + name);
		DynamixUtils.associateNewRole(name, 'nfc');
	},

	shareViaQRCode : function(name) {
		console.log("Share Via QR Code : " + name);
		DynamixUtils.associateNewRole(name, 'qr');
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
		$('#scopes-list').empty();
	}, 

	loadDataIntoView : function() {

		/*** Clear pre existing html from the page ***/
		this.reset();

		var currentRoleName = SharedData["currentRoleName"];

		/*** Update html data ***/
		this.updateHeader(currentRoleName);
		this.updateScopesList(currentRoleName);
		this.refreshAddNewScopesPopup();
	},

	updateHeader : function(name) {
		/**
		var scopesHeaderTemplate = Handlebars.getTemplate('scopes-page-header');
		var scopesHeaderCompiledHtml = scopesHeaderTemplate(name);
		$('#scopes-page').prepend(scopesHeaderCompiledHtml);
		$('#scopes-page').enhanceWithin();
		**/
		console.log(name);
		$('span#role-name').text(name);
	},

	updateScopesList : function(currentRoleName) {
		var that = this;
		if(Data.scopesForRole[currentRoleName] === undefined) {
			Data["scopesForRole"][currentRoleName] = [];
		}
		var scopes = Data.scopesForRole[currentRoleName];
		if( scopes !== undefined) {
			that.appendListItem('<li data-role="list-divider"> Current Scopes </li>');
			$.each(scopes, function(index, scopeId){
				var scopeName = Data.accessScopes[scopeId]["name"];
				var compiledHtml = that.getHtmlFromNameAndId(scopeName, scopeId);
				that.appendListItem(compiledHtml);
			});
		}
		
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
		var count = 0;
		for(var key in Data.accessScopes) {
			//Only show scopes which don't already exist for this role
			if(Data.accessScopes.hasOwnProperty(key) && scopes.indexOf(key) == -1) {
				var accessScope = Data.accessScopes[key];
				var html = addExistingScopeListitemTemplate(accessScope)
				$('#scopes-select').append(html);
				count = count + 1;
			}
		}
		console.log("count : " + count);
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
		Db.updateAll();
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

	reset : function() {
		// $('#devices-header').remove();
		$('#plugins-list').empty();
		$('graph-id-select').empty();
	}, 

	getScope : function() {
		return Data["accessScopes"][this.currentScopeId()];
	},

	getAccessProfiles : function() {
		return Data["accessScopes"][this.currentScopeId()]["accessProfiles"];
	},

	currentScopeId : function(){
		return SharedData.currentScopeId;
	},

	scene : {
		model : {
			init : function(){
				if(typeof DeviceUtils.getScope()["scenes"] === 'undefined'){
					DeviceUtils.getScope()["scenes"] = [];
				}
				this.scenes = DeviceUtils.getScope()["scenes"];
			}, 

			getScenes : function(){
				return this.scenes;
			}, 

			addScene : function(name){
				Data["scenes"][name] = {'name' : name, 'commands' : {}, 'sceneGraphs' : []};
				this.scenes.push(name);
			}
		}, 

		view : {
			init : function(){
				this.scenesList = $('#scenes-list');
				this.scenesList.on('click', 'a.edit-scene', function(){
					console.log($(this).data("name"));
					SharedData["currentSceneName"] = $(this).data("name");
					$.mobile.pageContainer.pagecontainer("change", "#scene-editor");
				});
				this.scenesList.on('click', 'a.delete-scene', function(){
					console.log($(this).data("name"));
				});
				this.render();
			}, 

			render : function() {
				var that = this;
				this.scenesList.empty();
				var scenes = DeviceUtils.scene.octopus.getScenes();
				if(scenes.length > 0) {
					this.scenesList.append('<li data-role="list-divider"> Current Scenes </li>');
					$.each(scenes, function(index, scene){
						var template = Handlebars.getTemplate('scene-listitem');
						var html = template({'scene' : {'name' : scene}});
						that.scenesList.append(html);
					});
					this.scenesList.listview('refresh');
				}
			}
		}, 

		octopus : {
			init : function(){
				DeviceUtils.scene.model.init();
				DeviceUtils.scene.view.init();
			}, 

			getScenes : function(){
				return DeviceUtils.scene.model.getScenes();
			}, 

			addScene : function(name){
				DeviceUtils.scene.model.addScene(name);
				DeviceUtils.scene.view.render();
			}, 

			editScene : function(name){
				SharedData["currentSceneName"] = name;
			}
		}
	},

	loadDataIntoView : function() {
		this.reset();
		var that = this;
		var scope = this.getScope();
		this.updateHeader(scope.name);

		this.scene.octopus.init();
		
		$('#plugins-list').append('<li data-role="list-divider"> Current Devices </li>');

		$.each(scope.accessProfiles, function(index, plugin){
			that.addNewPluginListitem(plugin);
		});

		$.each(AmbientControlData.plugin_ids, function(index, id) {
			var plugin = {'pluginId' : id};
			var select = $('#addAccessControlForm').find('select');
			var pluginIdListitemTemplate = Handlebars.getTemplate('pluginid-listitem');
			var pluginIdListitemHtml = pluginIdListitemTemplate({plugin : plugin});
			select.append(pluginIdListitemHtml);
			select.selectmenu('refresh');
		});


		$('#plugins-list').on('click', 'a.edit-device' ,function(event) {
			var deviceId = $(this).closest('li.device-listitem').data('deviceid');;
 			var pluginId = $(this).closest('ul.device-list').data('pluginid');
 			that.editDevice(pluginId, deviceId);
		});

		$('#plugins-list').on('click', 'a.delete-device' ,function(event) {
			/*** Retrieve device id from the parent li **/
			var parentListitem = $(this).closest('li.device-listitem');
			var deviceId = parentListitem.data('deviceid');;
			/*** Retrieve plugin id from the parent ul **/
 			var pluginId = $(this).closest('ul.device-list').data('pluginid');
 			that.deleteDevice(pluginId, deviceId);
 			parentListitem.remove();
 			Db.updateAll();
		});
	}, 

	updateHeader : function(name) {
		// var devicesHeaderTemplate = Handlebars.getTemplate('devices-page-header');
		// var devicesHeaderCompiledHtml = devicesHeaderTemplate(name);
		// $('#devices-page').prepend(devicesHeaderCompiledHtml);
		// $('#devices-page').enhanceWithin();
		$('span#scope-name').text(name);
	},

	addNewPluginListitem : function(plugin) {
		var that = this;
		var pluginListitemTemplate = Handlebars.getTemplate('plugin-listitem');
		var pluginListitemCompiledHtml = pluginListitemTemplate({plugin: plugin});
		$('#plugins-list').append(pluginListitemCompiledHtml);
	 		for(var device_id in plugin.deviceProfiles) {
				if(plugin.deviceProfiles.hasOwnProperty(device_id)) {
					var deviceProfile = plugin.deviceProfiles[device_id];
					that.addDeviceToPlugin(device_id, plugin.pluginId);
				}
	 		}
		$('li.plugin-listitem.collapsible').collapsible();
		$('#plugins-list').listview('refresh');
	}, 

	addDeviceToPlugin : function(device_id, pluginId) {
		var device = {'name' : device_id, 'id' : device_id};
		var elems = $('.device-list[data-pluginid="' + pluginId + '"]');
		var deviceListitemTemplate = Handlebars.getTemplate('device-listitem');
		var deviceListitemCompiledHtml = deviceListitemTemplate({device : device});
		elems.append(deviceListitemCompiledHtml);$
	 	elems.listview();
	 	elems.listview('refresh');
	},

	deleteDevice : function(pluginId, deviceId) {
		var that = this;
		console.log("Delete device " + deviceId + " from " + pluginId + " for " + this.currentScopeId());
		var accessProfiles = this.getAccessProfiles();
		$.each(accessProfiles, function(index, plugin) {
			console.log(plugin.pluginId);
			if(plugin.pluginId == pluginId) {
				delete plugin.deviceProfiles[deviceId];
				return false;
			}
		});
	}, 

	editDevice : function(pluginId, deviceId) {
		console.log("Edit device " + deviceId + " from " + pluginId + " for " + this.currentScopeId());
		var that = this;

		/*** Clear popup ui. It might have existing data if the popup was openend before ***/
		$('#edit-device-commands-controlgroup').controlgroup("container").empty();

		$('#device-name').html(deviceId);
		var updateListOfCommands = function(pluginId, deviceId){
			var accessProfiles = that.getAccessProfiles();
			var pre_approved_commands; 
			$.each(accessProfiles, function(index, plugin) {
				console.log(plugin.pluginId);
				if(plugin.pluginId == pluginId) {
					pre_approved_commands = plugin["deviceProfiles"][deviceId];
					return false;
				}
			});
			console.log(pre_approved_commands);
			var callback = function(commands) {
				$.each(commands, function(index, command_name){
					var selected = true;
					if(pre_approved_commands.indexOf(command_name) == -1){
						selected = false;
					}
					var command = {'name' : command_name, 'selected' : selected};
					var deviceCommandListitemTemplate = Handlebars.getTemplate('command-listitem');
					var deviceCommandListitemHtml = deviceCommandListitemTemplate({command : command});
					$('#edit-device-commands-controlgroup').controlgroup("container").append(deviceCommandListitemHtml);
				});
				$("#edit-device-commands-controlgroup").enhanceWithin().controlgroup( "refresh" );
			};
			AmbientControlData.getCommandsFor(pluginId, callback);
		};

		updateListOfCommands(pluginId, deviceId);
		
		/*** Adding a listener using _one_ so that the listener doesn't get duplicated ***/
		$('#editDeviceAccessForm').one('submit', function(e){
			e.preventDefault();
			var data = $("#edit-device-commands-controlgroup :input").serializeArray();
			console.log(data);
			var approved_commands = [];
			$.each(data, function(index, command){
				if(command.value == "on"){
					approved_commands.push(command.name);
				}
			});
			console.log("Approving " + approved_commands +" for device " + deviceId);
			console.log("for " + that.currentScopeId() + " \n " + pluginId );
	 		/*** Adding data to the Data object ***/
	 		var accessProfiles = that.getAccessProfiles();
	 		$.each(accessProfiles, function(index, plugin) {
				if(plugin.pluginId == pluginId) {
					/** Since we are editing a device, it should pre exist in deviceProfiles***/
					console.log(plugin.deviceProfiles[deviceId]);
					plugin.deviceProfiles[deviceId] = [];
					console.log(plugin.deviceProfiles[deviceId]);
					plugin.deviceProfiles[deviceId] = plugin.deviceProfiles[deviceId].concat(approved_commands);
					console.log(plugin.deviceProfiles[deviceId]);
					return false;
				}
			});
			Db.updateAll();
	 		$('#editDeviceAccessPopup').popup('close');
		});
		$('#editDeviceAccessPopup').popup('open');
	},

	showAddNewDevicePopup : function(pluginId) {
		var that = this;
		console.log('Showing dialog for list of devices : ' + pluginId);

		/*** Clear popup ui. It might have existing data if the popup was openend before ***/
		$('#device-commands-controlgroup').controlgroup("container").empty();
		$('#device-id-select').empty();

		var deviceIdListitemTemplate = Handlebars.getTemplate('deviceid-listitem');
		var deviceIds = AmbientControlData.getDevicesFor(pluginId);
		$.each(deviceIds, function(index, deviceId){
			var device = {'deviceId' : deviceId};
			var deviceIdListItemHtml = deviceIdListitemTemplate({device : device});
			$('#device-id-select').append(deviceIdListItemHtml);
		});
		$('#device-id-select').selectmenu('refresh');

		var updateListOfCommands = function(pluginId){
			var deviceCommandListitemTemplate = Handlebars.getTemplate('command-listitem');
			var callback = function(commands) {
				$.each(commands, function(index, command_name){
					var command = {'name' : command_name, 'selected' : true};
					var deviceCommandListitemHtml = deviceCommandListitemTemplate({command : command});
					$('#device-commands-controlgroup').controlgroup("container").append(deviceCommandListitemHtml);
				});
				$("#device-commands-controlgroup").enhanceWithin().controlgroup( "refresh" );
			};
			AmbientControlData.getCommandsFor(pluginId, callback);
		};

		updateListOfCommands(pluginId);
		
		/*** Adding a listener using _one_ so that the listener doesn't get duplicated ***/
		$('#addDeviceToAccessControlForm').one('submit', function(e){
			e.preventDefault();
			var deviceId = $("#device-id-select").val();
			var data = $("#device-commands-controlgroup :input").serializeArray();
			var approved_commands = [];
			$.each(data, function(index, command){
				if(command.value == "on"){
					approved_commands.push(command.name);
				}
			});
			console.log("Approving " + approved_commands +" for device " + deviceId);
			console.log("for " + that.currentScopeId() + " \n " + pluginId );
	 		that.addDeviceToPlugin(deviceId, pluginId);
	 		/*** Adding data to the Data object ***/
	 		var accessProfiles = that.getAccessProfiles();
	 		$.each(accessProfiles, function(index, plugin) {
				if(plugin.pluginId == pluginId) {
					if(plugin.deviceProfiles[deviceId] === undefined){
						plugin.deviceProfiles[deviceId] = [];
					}
					plugin.deviceProfiles[deviceId] = plugin.deviceProfiles[deviceId].concat(approved_commands);
					console.log(plugin.deviceProfiles[deviceId]);
					return false;
				}
			});
	 		$('#addDeviceToAccessControlPopup').popup('close');
			Db.updateAll();
		});
		$('#addDeviceToAccessControlPopup').popup('open');
	}, 

	revokeFullAccess : function(pluginId) {
		console.log(pluginId);
		var accessProfiles = Data["accessScopes"][SharedData.currentScopeId]["accessProfiles"];
		$.each(accessProfiles, function(index, plugin) {
			console.log(plugin.pluginId);
			if(plugin.pluginId == pluginId) {
				var spliced = accessProfiles.splice(index, 1);
				return false;
			}
		});
	},

	isEmptyObject : function(obj) {
		for(var prop in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, prop)) {
				return false;
			}
		}
		return true;
	}

};

SceneEditor = {

	model : {
		init : function(){
			var sceneName = SharedData["currentSceneName"];
			this.scene = Data["scenes"][sceneName];
		},

		getGraphs : function(){
			if(typeof this.scene.sceneGraphs === 'undefined'){
				this.scene["sceneGraphs"] = [];
			}
			return this.scene.sceneGraphs;
		}, 

		/*
		getCommands : function(){
			if(typeof this.scene.commands === 'undefined')
				this.scene.commands = {};
			return this.scene.commands;
		}, 
		*/

		addGraph : function(graphName){
			this.scene.sceneGraphs.push(graphName);
		}, 

		getAccessProfilesForCurrentScope : function(){
			return DeviceUtils.getAccessProfiles();
		}, 

		updateCommands : function(pluginId, commands){
			if(typeof this.scene.commands === 'undefined'){
				this.scene.commands = {};
			}
			if(typeof this.scene.commands[pluginId] === 'undefined'){
				this.scene.commands[pluginId] = [];
			}
			var deviceCommands = this.scene.commands[pluginId];	
			console.log("Existing Commands");		
			console.log(deviceCommands);

			console.log("Updated Commands");
			console.log(commands);
			$.each(commands, function(index, command){
				var exists = false;
				$.each(deviceCommands, function(index, deviceCommand){
					if(command.deviceId == deviceCommand.deviceId && command.commandType == deviceCommand.commandType){
						console.log(deviceCommand);
						console.log(command);
						deviceCommands[index] = command;
						exists = true;
					}
				});
				if(!exists){
					deviceCommands.push(command);
				}
			});
			console.log(deviceCommands);
		}
	}, 

	view : {
		init : function(){
			var that = this;
			this.graphsListLegend = $('span#scene-name');
			this.graphSelector = $('select#graph-id-select');
			this.existingGraphsList = $('ul#graphs-list');
			this.pluginsList = $('div#scene-editor-plugins-list');
			$('#addNewGraphForm').on('submit', function(e){
				e.preventDefault();
				var graphName = $('#graph-id-select option:selected').data('name');
				SceneEditor.octopus.addGraph(graphName);
				that.render();
				Db.updateAll();
				$('#addNewGraphPopup').popup('close');
			});

			$.each(AmbientControlData.graphs, function(index, graph_name){
				var graph = {'name' : graph_name};
				var graphIdListitemTemplate = Handlebars.getTemplate('graphid-listitem');
				var graphIdListitemHtml = graphIdListitemTemplate({graph : graph});
				that.graphSelector.append(graphIdListitemHtml);
			});

			this.graphSelector.selectmenu('refresh');
			this.render();
		},

		render : function(){
			var that = this;
			this.graphsListLegend.text(SharedData["currentSceneName"]);
			this.existingGraphsList.empty();
			this.pluginsList.empty();
			$('a#save-widgets-state').remove();
			var existingGraphs = SceneEditor.octopus.getGraphs();
			if(existingGraphs.length > 0){
				that.existingGraphsList.append('<li data-role="header">Existing Graphs</li>');
				$.each(existingGraphs, function(index, graph_name){
					that.existingGraphsList.append('<li data-icon="delete"> <a href="#" data-name="'+ graph_name +'">' + graph_name + '</a></li>');
				});
				this.existingGraphsList.listview('refresh');
			}


			var widgetStateListener = function(pluginId, state){
				SceneEditor.octopus.updateCommands(pluginId, state);
			}

			var accessProfiles = SceneEditor.octopus.getAccessProfilesForCurrentScope();
			$.each(accessProfiles, function(index, accessProfile){
				var accessProfileName = accessProfile.name;
				var template = Handlebars.getTemplate('device-container');
				var html = template({accessProfile : accessProfile});
				that.pluginsList.append(html);

				var pluginId = accessProfile.pluginId;
				for(key in accessProfile.deviceProfiles){
					var data = {deviceId : key, commands : {}};
					var commands = accessProfile.deviceProfiles[key];
					$.each(commands, function(index, command){
						data["commands"][command] = true;
					});
					var template = Handlebars.getWidgetTemplate(pluginId);
					var html = template({data : data});
					var controlsContainerElem = $('ul.controls-container[data-pluginid="'+pluginId +'"]');
					var controlsListElem = controlsContainerElem.find('li.controls-list');
					controlsListElem.append(html);
					controlsListElem.enhanceWithin();
					if(DynamixWidgets["widgetsMap"][pluginId].watchState !== undefined){
						DynamixWidgets["widgetsMap"][pluginId].watchState(key, widgetStateListener);
					}
				}
				$('ul.controls-container').listview().listview('refresh');
			});

			$('div#scene-editor')
			.find('.ui-content')
			.append('<center><a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check" id="save-widgets-state">Save</a></center>');
			
			$('a#save-widgets-state').on('click', function(e){
				Db.updateAll();
			});
		}
	}, 

	octopus : {
		init : function(){
			SceneEditor.model.init();
			SceneEditor.view.init();
		}, 

		addGraph : function(graphName){
			SceneEditor.model.addGraph(graphName);
		}, 

		getGraphs : function(){
			return SceneEditor.model.getGraphs();
		}, 

		getAccessProfilesForCurrentScope : function(){
			return SceneEditor.model.getAccessProfilesForCurrentScope();
		}, 

		updateCommands : function(pluginId, commands){
			SceneEditor.model.updateCommands(pluginId, commands);
		}
	}
};

Handlebars.getWidgetTemplate = function(pluginId) {
	if (Handlebars.templates === undefined || Handlebars.templates[pluginId] === undefined) {
	    $.ajax({
	        url : 'scripts/dynamix/widgets/templates/' + DynamixWidgets.widgetsMap[pluginId]["template"] + '.handlebars',
	        success : function(data) {
	            if (Handlebars.templates === undefined) {
	                Handlebars.templates = {};
	            }
	            Handlebars.templates[pluginId] = Handlebars.compile(data);
	        },
	        async : false, 
	        cache: false
	    });
	}
	return Handlebars.templates[pluginId];
};
