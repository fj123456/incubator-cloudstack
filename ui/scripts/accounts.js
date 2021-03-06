// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
(function(cloudStack) {
  
	var domainObjs;
	var rootDomainId;

  cloudStack.sections.accounts = {
    title: 'label.accounts',
    id: 'accounts',
    sectionSelect: {
      label: 'Select View',
      preFilter: function() {
        return ['accounts'];
      }
    },
    sections: {
      accounts: {
        type: 'select',
        id: 'accounts',
        title: 'label.accounts',
        listView: {
          id: 'accounts',
          fields: {
            name: { label: 'label.name' },
            accounttype: {
              label: 'label.role',
              converter: function(args){
                return cloudStack.converters.toRole(args);
              }
            },
            domain: { label: 'label.domain' },
            state: {
              converter: function(str) {
                // For localization
                return str;
              },
              label: 'label.state',             
              indicator: {
                'enabled': 'on',
                'Destroyed': 'off',
                'disabled': 'off'
              }
            }
          },

          actions: {
            add: {
              label: 'label.add.account',
              preFilter: function(args) {
                if(isAdmin())
                  return true;
                else
                  return false;
              },
              messages: {
                notification: function(args) {
                  return 'label.add.account';
                }
              },

              createForm: {
                title: 'label.add.account',
                desc: 'label.add.account',
                fields: {
                  username: {
                    label: 'label.username',
                    validation: { required: true },
                    docID: 'helpAccountUsername'
                  },
                  password: {
                    label: 'label.password',
                    validation: { required: true },
                    isPassword: true,
                    id: 'password',
                    docID: 'helpAccountPassword'
                  },
                  'password-confirm': {
                    label: 'label.confirm.password',
                    validation: {
                      required: true,
                      equalTo: '#password'
                    },
                    isPassword: true,
                    docID: 'helpAccountConfirmPassword'
                  },
                  email: {
                    label: 'label.email',
                    validation: { required: true, email:true },
                    docID: 'helpAccountEmail'
                  },
                  firstname: {
                    label: 'label.first.name',
                    validation: { required: true },
                    docID: 'helpAccountFirstName'
                  },
                  lastname: {
                    label: 'label.last.name',
                    validation: { required: true },
                    docID: 'helpAccountLastName'
                  },
                  domainid: {
                    label: 'label.domain',
                    docID: 'helpAccountDomain',
                    validation: { required: true },
                    select: function(args) {
                      var data = {};

                      if (args.context.users) { // In accounts section
                        data.listAll = true;
                      } else if (args.context.domains) { // In domain section (use specific domain)
                        data.id = args.context.domains[0].id;
                      }

                      $.ajax({
                        url: createURL("listDomains"),
                        data: data,
                        dataType: "json",
                        async: false,
                        success: function(json) {
                          var items = [];
                          domainObjs = json.listdomainsresponse.domain;
                          $(domainObjs).each(function() {
                            items.push({ id: this.id, description: this.path });

                            if(this.level == 0)
                              rootDomainId = this.id;
                          });
                          args.response.success({ data: items });
                        }
                      });
                    }
                  },
                  account: {
                    label: 'label.account',
                    docID: 'helpAccountAccount'
                  },
                  accounttype: {
                    label: 'label.type',
                    docID: 'helpAccountType',
                    validation: { required: true },
                    select: function(args) {
                      var items = [];
                      items.push({id:0, description: "User"});  //regular-user
                      items.push({id:1, description: "Admin"}); //root-admin
                      args.response.success({data: items});
                    }
                  },
                  timezone: {
                    label: 'label.timezone',
                    docID: 'helpAccountTimezone',
                    select: function(args) {
                      var items = [];
                      items.push({id: "", description: ""});
                      for(var p in timezoneMap)
                        items.push({id: p, description: timezoneMap[p]});
                      args.response.success({data: items});
                    }
                  },
                  networkdomain: {
                    label: 'label.network.domain',
                    docID: 'helpAccountNetworkDomain',
                    validation: { required: false }
                  }
                }
              },

              action: function(args) {
                var array1 = [];
                array1.push("&username=" + todb(args.data.username));
                var errorMsg = "";
                var password = args.data.password;
                if (md5Hashed)
                  password = $.md5(password);
								else
                  password = todb(password);
                array1.push("&password=" + password);

                array1.push("&email=" + todb(args.data.email));
                array1.push("&firstname=" + todb(args.data.firstname));
                array1.push("&lastname=" + todb(args.data.lastname));

                array1.push("&domainid=" + args.data.domainid);

                var account = args.data.account;
                if(account == null || account.length == 0)
                  account = args.data.username;
                array1.push("&account=" + todb(account));

                var accountType = args.data.accounttype;							
                if (args.data.accounttype == "1" && args.data.domainid != rootDomainId) //if account type is admin, but domain is not Root domain
                  accountType = "2"; // Change accounttype from root-domain("1") to domain-admin("2")
                array1.push("&accounttype=" + accountType);

                if(args.data.timezone != null && args.data.timezone.length > 0)
                  array1.push("&timezone=" + todb(args.data.timezone));

                if(args.data.networkdomain != null && args.data.networkdomain.length > 0)
                  array1.push("&networkdomain=" + todb(args.data.networkdomain));

                $.ajax({
                  url: createURL("createAccount" + array1.join("")),
                  dataType: "json",
                  success: function(json) {
                    var item = json.createaccountresponse.account;
                    args.response.success({data:item});
                  },
                  error: function(XMLHttpResponse) {
                    var errorMsg = parseXMLHttpResponse(XMLHttpResponse);
                    args.response.error(errorMsg);
                  }
                });
              },

              notification: {
                poll: function(args) {
                  args.complete({
                    actionFilter: accountActionfilter
                  });
                }
              }
            }
          },

          dataProvider: function(args) {
            var array1 = [];
            if(args.filterBy != null) {
              if(args.filterBy.search != null && args.filterBy.search.by != null && args.filterBy.search.value != null) {
                switch(args.filterBy.search.by) {
                case "name":
                  if(args.filterBy.search.value.length > 0)
                    array1.push("&keyword=" + args.filterBy.search.value);
                  break;
                }
              }
            }

            if("domains" in args.context)
              array1.push("&domainid=" + args.context.domains[0].id);
            $.ajax({
              url: createURL("listAccounts" + "&page=" + args.page + "&pagesize=" + pageSize + array1.join("") + '&listAll=true'),
              dataType: "json",
              async: true,
              success: function(json) {
                var items = json.listaccountsresponse.account;
                args.response.success({
                  actionFilter: accountActionfilter,
                  data:items
                });
              }
            });
          },

          detailView: {
            name: 'Account details',
            viewAll: { path: 'accounts.users', label: 'label.users' },

            actions: {
              edit: {
                label: 'message.edit.account',
                compactLabel: 'label.edit',
                action: function(args) {
                  var errorMsg = "";
                  var accountObj = args.context.accounts[0];

                  var array1 = [];
                  array1.push("&newname=" + todb(args.data.name));
                  array1.push("&networkdomain=" + todb(args.data.networkdomain));
                  $.ajax({
                    url: createURL("updateAccount&domainid=" + accountObj.domainid + "&account=" + accountObj.name + array1.join("")),
                    dataType: "json",
                    async: false,
                    success: function(json) {
                      accountObj = json.updateaccountresponse.account;
                    },
                    error: function(json) {
                      errorMsg = parseXMLHttpResponse(json);
                      args.response.error(errorMsg);
                    }
 
                  });

									if(args.data.vmLimit != null) {
										$.ajax({
											url: createURL("updateResourceLimit&resourceType=0&max=" + todb(args.data.vmLimit) + "&account=" + accountObj.name + "&domainid=" + accountObj.domainid),
											dataType: "json",
											async: false,
											success: function(json) {
												accountObj["vmLimit"] = args.data.vmLimit;
											}
										});
									}

									if(args.data.ipLimit != null) {
										$.ajax({
											url: createURL("updateResourceLimit&resourceType=1&max=" + todb(args.data.ipLimit) + "&account=" + accountObj.name + "&domainid=" + accountObj.domainid),
											dataType: "json",
											async: false,
											success: function(json) {
												accountObj["ipLimit"] = args.data.ipLimit;
											}
										});
									}

									if(args.data.volumeLimit != null) {
										$.ajax({
											url: createURL("updateResourceLimit&resourceType=2&max=" + todb(args.data.volumeLimit) + "&account=" + accountObj.name + "&domainid=" + accountObj.domainid),
											dataType: "json",
											async: false,
											success: function(json) {
												accountObj["volumeLimit"] = args.data.volumeLimit;
											}
										});
									}

									if(args.data.snapshotLimit != null) {
										$.ajax({
											url: createURL("updateResourceLimit&resourceType=3&max=" + todb(args.data.snapshotLimit) + "&account=" + accountObj.name + "&domainid=" + accountObj.domainid),
											dataType: "json",
											async: false,
											success: function(json) {
												accountObj["snapshotLimit"] = args.data.snapshotLimit;
											}
										});
									}
 
                  if(args.data.templateLimit != null) {
										$.ajax({
											url: createURL("updateResourceLimit&resourceType=4&max=" + todb(args.data.templateLimit) + "&account=" + accountObj.name + "&domainid=" + accountObj.domainid),
											dataType: "json",
											async: false,
											success: function(json) {
												accountObj["templateLimit"] = args.data.templateLimit;
											}
										});
                  }
									
									if(args.data.vpcLimit != null) {
										$.ajax({
											url: createURL("updateResourceLimit&resourceType=7&max=" + todb(args.data.vpcLimit) + "&account=" + accountObj.name + "&domainid=" + accountObj.domainid),
											dataType: "json",
											async: false,
											success: function(json) {
												accountObj["vpcLimit"] = args.data.vpcLimit;
											}
										});
									}

                  if(errorMsg == "")
                  args.response.success({data: accountObj});
                }
              },

              updateResourceCount: {
                label: 'label.action.update.resource.count',
                messages: {
                  confirm: function(args) {
                    return 'message.update.resource.count';
                  },
                  notification: function(args) {
                    return 'label.action.update.resource.count';
                  }
                },
                action: function(args) {
                  var accountObj = args.context.accounts[0];
                  $.ajax({
                    url: createURL("updateResourceCount&domainid=" + accountObj.domainid + "&account=" + accountObj.name),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      //var resourcecounts= json.updateresourcecountresponse.resourcecount;   //do nothing
                      args.response.success();
                    },
                    error: function(json) {
                      args.response.error(parseXMLHttpResponse(json));
                    }
                  });
                },
                notification: {
                  poll: function(args) {
                    args.complete();
                  }
                }
              },

              disable: {
                label: 'label.action.disable.account',
                messages: {
                  confirm: function(args) {
                    return 'message.disable.account';
                  },
                  notification: function(args) {
                    return 'label.action.disable.account';
                  }
                },
                action: function(args) {
                  var accountObj = args.context.accounts[0];
                  $.ajax({
                    url: createURL("disableAccount&lock=false&domainid=" + accountObj.domainid + "&account=" + accountObj.name),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.disableaccountresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return json.queryasyncjobresultresponse.jobresult.account;
                          },
                          getActionFilter: function() {
                            return accountActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              lock: {
                label: 'label.action.lock.account',
                messages: {
                  confirm: function(args) {
                    return 'message.lock.account';
                  },
                  notification: function(args) {
                    return 'label.action.lock.account';
                  }
                },
                action: function(args) {
                  var accountObj = args.context.accounts[0];
                  $.ajax({
                    url: createURL("disableAccount&lock=true&domainid=" + accountObj.domainid + "&account=" + accountObj.name),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.disableaccountresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return json.queryasyncjobresultresponse.jobresult.account;
                          },
                          getActionFilter: function() {
                            return accountActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              enable: {
                label: 'label.action.enable.account',
                messages: {
                  confirm: function(args) {
                    return 'message.enable.account';
                  },
                  notification: function(args) {
                    return 'label.action.enable.account';
                  }
                },
                action: function(args) {
                  var accountObj = args.context.accounts[0];
                  $.ajax({
                    url: createURL("enableAccount&domainid=" + accountObj.domainid + "&account=" + accountObj.name),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      args.response.success({data: json.enableaccountresponse.account});
                    }
                  });
                },
                notification: {
                  poll: function(args) {
                    args.complete({
                      data: { state: 'enabled' }
                    });
                  }
                }
              },

              remove: {
                label: 'label.action.delete.account',
                messages: {
                  confirm: function(args) {
                    return 'message.delete.account';
                  },
                  notification: function(args) {
                    return 'label.action.delete.account';
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("deleteAccount&id=" + args.context.accounts[0].id),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.deleteaccountresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return {}; //nothing in this account needs to be updated, in fact, this whole account has being deleted
                          },
                          getActionFilter: function() {
                            return accountActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              }

            },

            tabs: {
              details: {
                title: 'label.details',

                fields: [
                  {
                    name: {
                      label: 'label.name',
                      isEditable: true,
					            validation: { required: true }
                    }
                  },
                  {
                    id: { label: 'ID' },
                    accounttype: {
                      label: 'label.role',
                      converter: function(args){
                        return cloudStack.converters.toRole(args);
                      }
                    },
                    domain: { label: 'label.domain' },
                    state: { label: 'label.state' },
                    networkdomain: {
                     label: 'label.network.domain',
                     isEditable: true
                    },
                    vmLimit: {
                      label: 'label.instance.limits',
                      isEditable: function(context) {											  
											  if (context.accounts[0].accounttype == roleTypeUser || context.accounts[0].accounttype == roleTypeDomainAdmin) //updateResourceLimits is only allowed on account whose type is user or domain-admin
												  return true;
												else
												  return false;
											}
                    },
                    ipLimit: {
                      label: 'label.ip.limits',
                      isEditable: function(context) {											  
											  if (context.accounts[0].accounttype == roleTypeUser || context.accounts[0].accounttype == roleTypeDomainAdmin) //updateResourceLimits is only allowed on account whose type is user or domain-admin
												  return true;
												else
												  return false;
											}
                    },
                    volumeLimit: {
                      label: 'label.volume.limits',
                      isEditable: function(context) {											  
											  if (context.accounts[0].accounttype == roleTypeUser || context.accounts[0].accounttype == roleTypeDomainAdmin) //updateResourceLimits is only allowed on account whose type is user or domain-admin
												  return true;
												else
												  return false;
											}
                    },
                    snapshotLimit: {
                      label: 'label.snapshot.limits',
                      isEditable: function(context) {											  
											  if (context.accounts[0].accounttype == roleTypeUser || context.accounts[0].accounttype == roleTypeDomainAdmin) //updateResourceLimits is only allowed on account whose type is user or domain-admin
												  return true;
												else
												  return false;
											}
                    },
                    templateLimit: {
                      label: 'label.template.limits',
                      isEditable: function(context) {											  
											  if (context.accounts[0].accounttype == roleTypeUser || context.accounts[0].accounttype == roleTypeDomainAdmin) //updateResourceLimits is only allowed on account whose type is user or domain-admin
												  return true;
												else
												  return false;
											}
                    },
                    vpcLimit: {
                      label: 'VPC limits',
                      isEditable: function(context) {											  
											  if (context.accounts[0].accounttype == roleTypeUser || context.accounts[0].accounttype == roleTypeDomainAdmin) //updateResourceLimits is only allowed on account whose type is user or domain-admin
												  return true;
												else
												  return false;
											}
                    },

                    vmtotal: { label: 'label.total.of.vm' },
                    iptotal: { label: 'label.total.of.ip' },
                    receivedbytes: {
                      label: 'label.bytes.received',
                      converter: function(args) {
                        if (args == null || args == 0)
                          return "";
                        else
                          return cloudStack.converters.convertBytes(args);
                      }
                    },
                    sentbytes: {
                      label: 'label.bytes.sent',
                      converter: function(args) {
                        if (args == null || args == 0)
                          return "";
                        else
                          return cloudStack.converters.convertBytes(args);
                      }
                    }
                  }
                ],

                dataProvider: function(args) {
									$.ajax({
										url: createURL("listAccounts&id=" + args.context.accounts[0].id),
										dataType: "json",										
										success: function(json) {		
											var accountObj = json.listaccountsresponse.account[0];

											$.ajax({
												url: createURL("listResourceLimits&domainid=" + accountObj.domainid + "&account=" + todb(accountObj.name)),
												dataType: "json",												
												success: function(json) {
													var limits = json.listresourcelimitsresponse.resourcelimit;													
													if (limits != null) {
														for (var i = 0; i < limits.length; i++) {
															var limit = limits[i];
															switch (limit.resourcetype) {
															case "0":
																accountObj["vmLimit"] = limit.max;
																break;
															case "1":
																accountObj["ipLimit"] = limit.max;
																break;
															case "2":
																accountObj["volumeLimit"] = limit.max;
																break;
															case "3":
																accountObj["snapshotLimit"] = limit.max;
																break;
															case "4":
																accountObj["templateLimit"] = limit.max;
																break;
                              case "7":
																accountObj["vpcLimit"] = limit.max;
																break;
															}
														}
													}																										
													args.response.success(
														{
															actionFilter: accountActionfilter,
															data: accountObj 
														}
													);							
												}
											});											
										}
									});		
                }
              }
            }
          }
        }
      },
      users: {
        type: 'select',
        id: 'users',
        title: 'label.users',
        listView: {
          id: 'users',
          fields: {
            username: { label: 'label.username', editable: true },
            firstname: { label: 'label.first.name' },
            lastname: { label: 'label.last.name' }
          },
          dataProvider: function(args) {
            var array1 = [];
            if(args.filterBy != null) {
              if(args.filterBy.search != null && args.filterBy.search.by != null && args.filterBy.search.value != null) {
                switch(args.filterBy.search.by) {
                case "name":
                  if(args.filterBy.search.value.length > 0)
                    array1.push("&keyword=" + args.filterBy.search.value);
                  break;
                }
              }
            }

            var accountObj = args.context.accounts[0];
						if(isAdmin() || isDomainAdmin()) {
							$.ajax({
								url: createURL("listUsers&domainid=" + accountObj.domainid + "&account=" + todb(accountObj.name) + "&page=" + args.page + "&pagesize=" + pageSize + array1.join("")),
								dataType: "json",
								success: function(json) {
									args.response.success({
										actionFilter: userActionfilter,
										data: json.listusersresponse.user
									});
								}
							})
						}
						else { //normal user doesn't have access listUsers API until Bug 14127 is fixed.
							args.response.success({
								actionFilter: userActionfilter,
								data: accountObj.user
							});
						}
          },
          actions: {
            add: {
              label: 'label.add.user',

              preFilter: function(args) {
                if(isAdmin())
                  return true;
                else
                  return false;
              },

              messages: {
                notification: function(args) {
                  return 'label.add.user';
                }
              },

              createForm: {
                title: 'label.add.user',
                fields: {
                  username: {
                    label: 'label.username',
                    validation: { required: true },
                    docID: 'helpUserUsername'
                  },
                  password: {
                    label: 'label.password',
                    isPassword: true,
                    validation: { required: true },
                    id: 'password',
                    docID: 'helpUserPassword'
                  },
                  'password-confirm': {
                    label: 'label.confirm.password',
                    docID: 'helpUserConfirmPassword',
                    validation: {
                      required: true,
                      equalTo: '#password'
                    },
                    isPassword: true
                  },
                  email: {
                    label: 'label.email',
                    docID: 'helpUserEmail',
                    validation: { required: true, email: true }
                  },
                  firstname: {
                    label: 'label.first.name',
                    docID: 'helpUserFirstName',
                    validation: { required: true }
                  },
                  lastname: {
                    label: 'label.last.name',
                    docID: 'helpUserLastName',
                    validation: { required: true }
                  },
                  timezone: {
                    label: 'label.timezone',
                    docID: 'helpUserTimezone',
                    select: function(args) {
                      var items = [];
                      items.push({id: "", description: ""});
                      for(var p in timezoneMap)
                        items.push({id: p, description: timezoneMap[p]});
                      args.response.success({data: items});
                    }
                  }
                }
              },

              action: function(args) {
                var accountObj = args.context.accounts[0];

                var array1 = [];
                array1.push("&username=" + todb(args.data.username));

                var password = args.data.password;
                if (md5Hashed)
                  password = $.md5(password);
                else
                  password = todb(password);
                array1.push("&password=" + password);

                array1.push("&email=" + todb(args.data.email));
                array1.push("&firstname=" + todb(args.data.firstname));
                array1.push("&lastname=" + todb(args.data.lastname));
                if(args.data.timezone != null && args.data.timezone.length > 0)
                  array1.push("&timezone=" + todb(args.data.timezone));

                array1.push("&domainid=" + accountObj.domainid);
                array1.push("&account=" + todb(accountObj.name));
                array1.push("&accounttype=" + accountObj.accounttype);

                $.ajax({
                  url: createURL("createUser" + array1.join("")),
                  dataType: "json",
                  success: function(json) {
                    var item = json.createuserresponse.user;
                    args.response.success({data: item});
                  },
                  error: function(XMLHttpResponse) {
                    var errorMsg = parseXMLHttpResponse(XMLHttpResponse);
                    args.response.error(errorMsg);
                  }
                });
              },

              notification: {
                poll: function(args) {
                  args.complete();
                }
              }
            }
          },

          detailView: {
            name: 'User details',
            isMaximized: true,
            actions: {
              edit: {
                label: 'label.edit',
                action: function(args) {
                  var array1 = [];
                  array1.push("&username=" + todb(args.data.username));
                  array1.push("&email=" + todb(args.data.email));
                  array1.push("&firstname=" + todb(args.data.firstname));
                  array1.push("&lastname=" + todb(args.data.lastname));
                  array1.push("&timezone=" + todb(args.data.timezone));
                  $.ajax({
                    url: createURL("updateUser&id=" + args.context.users[0].id + array1.join("")),
                    dataType: "json",
                    success: function(json) {
                      var item = json.updateuserresponse.user;
                      args.response.success({data:item});
                    },
                    error: function(data) {
                      args.response.error(parseXMLHttpResponse(data));
                    }
                  });

                }
              },

              changePassword: {
                label: 'label.action.change.password',
                messages: {
                  notification: function(args) {
                    return 'label.action.change.password';
                  }
                },
                createForm: {
                  title: 'label.action.change.password',
                  fields: {
                    newPassword: {
                      label: 'label.new.password',
                      isPassword: true,
                      validation: { required: true },
					            id: 'newPassword'
                    },
					          'password-confirm': {
						          label: 'label.confirm.password',
						          validation: {
							          required: true,
							          equalTo: '#newPassword'
						          },
						          isPassword: true
					          }
                  }
                },
                action: function(args) {
                  var password = args.data.newPassword;
                  if (md5Hashed)
                    password = $.md5(password);
                  else
                    password = todb(password);
                  $.ajax({
                    url: createURL("updateUser&id=" + args.context.users[0].id + "&password=" + password),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      args.response.success({data: json.updateuserresponse.user});
                    }
                  });
                },
                notification: {
                  poll: function(args) {
                    args.complete();
                  }
                }
              },

              generateKeys: {
                label: 'label.action.generate.keys',
                messages: {
                  confirm: function(args) {
                    return 'message.generate.keys';
                  },
                  notification: function(args) {
                    return 'label.action.generate.keys';
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("registerUserKeys&id=" + args.context.users[0].id),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      args.response.success({data: json.registeruserkeysresponse.userkeys});
                    }
                  });
                },
                notification: {
                  poll: function(args) {
                    args.complete();
                  }
                }
              },

              disable: {
                label: 'label.action.disable.user',
                messages: {
                  confirm: function(args) {
                    return 'message.disable.user';
                  },
                  notification: function(args) {
                    return 'label.action.disable.user';
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("disableUser&id=" + args.context.users[0].id),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.disableuserresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return json.queryasyncjobresultresponse.jobresult.user;
                          },
                          getActionFilter: function() {
                            return userActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              enable: {
                label: 'label.action.enable.user',
                messages: {
                  confirm: function(args) {
                    return 'message.enable.user';
                  },
                  notification: function(args) {
                    return 'label.action.enable.user';
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("enableUser&id=" + args.context.users[0].id),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      args.response.success({data: json.enableuserresponse.user});
                    },
                    error: function(json) {
                      args.response.error(parseXMLHttpResponse(json));
                    }
                  });
                },
                notification: {
                  poll: function(args) {
                    args.complete();
                  }
                }
              },

              remove: {
                label: 'label.action.delete.user',
                messages: {
                  confirm: function(args) {
                    return 'message.delete.user';
                  },
                  notification: function(args) {
                    return 'label.action.delete.user';
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("deleteUser&id=" + args.context.users[0].id),
                    dataType: "json",
                    async: true,
                    success: function(json) {
										  args.response.success();
										}
                  });
                },
                notification: {
                  poll: function(args) {
                    args.complete();
                  }
                }
              }
            },
            tabs: {
              details: {
                title: 'label.details',

                fields: [
                  {
                    username: {
                      label: 'label.name',
                      isEditable: true,
					            validation: { required: true }
                    }
                  },
                  {
                    id: { label: 'ID' },
                    state: { label: 'label.state' },
                    apikey: { label: 'label.api.key' },
                    secretkey: { label: 'label.secret.key' },
                    account: { label: 'label.account.name' },
                    accounttype: {
                      label: 'label.role',
                      converter: function(args) {
                        return cloudStack.converters.toRole(args);
                      }
                    },
                    domain: { label: 'label.domain' },
                    email: {
                      label: 'label.email',
                      isEditable: true,
					            validation: { required: true, email: true }
                    },
                    firstname: {
                      label: 'label.first.name',
                      isEditable: true,
					            validation: { required: true }
                    },
                    lastname: {
                      label: 'label.last.name',
                      isEditable: true,
					            validation: { required: true }
                    },
                    timezone: {
                      label: 'label.timezone',
                      converter: function(args) {
                        if(args == null || args.length == 0)
                          return "";
                        else
                          return args;
                      },
                      isEditable: true,
                      select: function(args) {
                        var items = [];
                        items.push({id: "", description: ""});
                        for(var p in timezoneMap)
                          items.push({id: p, description: timezoneMap[p]});
                        args.response.success({data: items});
                      }
                    }
                  }
                ],

                dataProvider: function(args) {
								  if(isAdmin() || isDomainAdmin()) {								
										$.ajax({
											url: createURL('listUsers'),
											data: {
												id: args.context.users[0].id
											},
											success: function(json) {
												args.response.success({
													actionFilter: userActionfilter,
													data: json.listusersresponse.user[0]
												});
											}
										});
									}
									else { //normal user doesn't have access listUsers API until Bug 14127 is fixed.							
									  args.response.success({
											actionFilter: userActionfilter,
											data: args.context.users[0]
										});		
									}									
                }
              }
            }
          }
        }
      }
    }
  };

  var accountActionfilter = function(args) {
    var jsonObj = args.context.item;
    var allowedActions = [];

    if (jsonObj.state == 'Destroyed') return [];

    if(isAdmin()) {
		  allowedActions.push("edit"); //updating networkdomain is allowed on any account, including system-generated default admin account 
      if(!(jsonObj.domain == "ROOT" && jsonObj.name == "admin" && jsonObj.accounttype == 1)) { //if not system-generated default admin account    
        if(jsonObj.state == "enabled") {
          allowedActions.push("disable");
          allowedActions.push("lock");
        }
        else if(jsonObj.state == "disabled" || jsonObj.state == "locked") {
          allowedActions.push("enable");
        }
        allowedActions.push("remove");
      }
			allowedActions.push("updateResourceCount");
    }		
		else if(isDomainAdmin()) {
      allowedActions.push("updateResourceCount");
		}	
    return allowedActions;
  }

  var userActionfilter = function(args) {
    var jsonObj = args.context.item;
    var allowedActions = [];
    if(isAdmin()) {
      allowedActions.push("edit");
      allowedActions.push("changePassword");
      allowedActions.push("generateKeys");
      if(!(jsonObj.domain == "ROOT" && jsonObj.account == "admin" && jsonObj.accounttype == 1)) { //if not system-generated default admin account user 
        if(jsonObj.state == "enabled")
          allowedActions.push("disable");
        if(jsonObj.state == "disabled")
          allowedActions.push("enable");
        allowedActions.push("remove");
      }
    }
    return allowedActions;
  }

})(cloudStack);
