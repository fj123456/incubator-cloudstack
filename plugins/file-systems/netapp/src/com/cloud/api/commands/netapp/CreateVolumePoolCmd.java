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
package com.cloud.api.commands.netapp;

import org.apache.log4j.Logger;

import com.cloud.api.ApiConstants;
import com.cloud.api.BaseCmd;
import com.cloud.api.Implementation;
import com.cloud.api.Parameter;
import com.cloud.api.ServerApiException;
import com.cloud.exception.ConcurrentOperationException;
import com.cloud.exception.InsufficientCapacityException;
import com.cloud.exception.InvalidParameterValueException;
import com.cloud.exception.ResourceAllocationException;
import com.cloud.exception.ResourceUnavailableException;
import com.cloud.netapp.NetappManager;
import com.cloud.server.ManagementService;
import com.cloud.server.api.response.netapp.CreateVolumePoolCmdResponse;
import com.cloud.utils.component.ComponentLocator;

@Implementation(description="Create a pool", responseObject = CreateVolumePoolCmdResponse.class)
public class CreateVolumePoolCmd extends BaseCmd {
	public static final Logger s_logger = Logger.getLogger(CreateVolumePoolCmd.class.getName());
    private static final String s_name = "createpoolresponse";

    @Parameter(name=ApiConstants.NAME, type=CommandType.STRING, required = true, description="pool name.")
	private String poolName;
    @Parameter(name=ApiConstants.ALGORITHM, type=CommandType.STRING, required = true, description="algorithm.")
	private String algorithm;
    
    public String getPoolName() {
    	return poolName;
    }
    
    public String getAlgorithm() {
    	return algorithm;
    }

	@Override
	public void execute() throws ResourceUnavailableException,
			InsufficientCapacityException, ServerApiException,
			ConcurrentOperationException, ResourceAllocationException {
		ComponentLocator locator = ComponentLocator.getLocator(ManagementService.Name);
    	NetappManager netappMgr = locator.getManager(NetappManager.class);
    	
    	try {
    		CreateVolumePoolCmdResponse response = new CreateVolumePoolCmdResponse();
    		netappMgr.createPool(getPoolName(), getAlgorithm());
    		response.setResponseName(getCommandName());
    		this.setResponseObject(response);
    	} catch (InvalidParameterValueException e) {
    		throw new ServerApiException(BaseCmd.INTERNAL_ERROR, e.toString());
    	}
		
	}

	@Override
	public String getCommandName() {
		// TODO Auto-generated method stub
		return s_name;
	}

	@Override
	public long getEntityOwnerId() {
		// TODO Auto-generated method stub
		return 0;
	}
    
}
