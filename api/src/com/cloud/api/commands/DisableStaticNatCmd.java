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
package com.cloud.api.commands;

import org.apache.log4j.Logger;

import com.cloud.api.ApiConstants;
import com.cloud.api.BaseAsyncCmd;
import com.cloud.api.BaseCmd;
import com.cloud.api.IdentityMapper;
import com.cloud.api.Implementation;
import com.cloud.api.Parameter;
import com.cloud.api.ServerApiException;
import com.cloud.api.response.SuccessResponse;
import com.cloud.event.EventTypes;
import com.cloud.exception.InsufficientAddressCapacityException;
import com.cloud.exception.InvalidParameterValueException;
import com.cloud.exception.NetworkRuleConflictException;
import com.cloud.exception.ResourceUnavailableException;
import com.cloud.network.IpAddress;

@Implementation(description="Disables static rule for given ip address", responseObject=SuccessResponse.class)
public class DisableStaticNatCmd extends BaseAsyncCmd {
    public static final Logger s_logger = Logger.getLogger(DeletePortForwardingRuleCmd.class.getName());
    private static final String s_name = "disablestaticnatresponse";

    /////////////////////////////////////////////////////
    //////////////// API parameters /////////////////////
    /////////////////////////////////////////////////////

    @IdentityMapper(entityTableName="user_ip_address")
    @Parameter(name=ApiConstants.IP_ADDRESS_ID, type=CommandType.LONG, required=true, description="the public IP address id for which static nat feature is being disableed")
    private Long ipAddressId;
    
    /////////////////////////////////////////////////////
    /////////////////// Accessors ///////////////////////
    /////////////////////////////////////////////////////

    public Long getIpAddress() {
        return ipAddressId;
    }
    
    /////////////////////////////////////////////////////
    /////////////// API Implementation///////////////////
    /////////////////////////////////////////////////////
    @Override
    public String getCommandName() {
        return s_name;
    }
    
    @Override
    public String getEventType() {
        return EventTypes.EVENT_DISABLE_STATIC_NAT;
    }

    @Override
    public String getEventDescription() {
        return  ("Disabling static nat for ip id=" + ipAddressId);
    }
    
    @Override
    public long getEntityOwnerId() {
        return _entityMgr.findById(IpAddress.class, ipAddressId).getAccountId();
    }
    
    @Override
    public void execute() throws ResourceUnavailableException, NetworkRuleConflictException, InsufficientAddressCapacityException {
        boolean result = _rulesService.disableStaticNat(ipAddressId);
        
        if (result) {
            SuccessResponse response = new SuccessResponse(getCommandName());
            this.setResponseObject(response);
        } else {
            throw new ServerApiException(BaseCmd.INTERNAL_ERROR, "Failed to disable static nat");
        }
    }
    
    
    @Override
    public String getSyncObjType() {
        return BaseAsyncCmd.networkSyncObject;
    }

    @Override
    public Long getSyncObjId() {
        return getIp().getAssociatedWithNetworkId();
    }

    private IpAddress getIp() {
        IpAddress ip = _networkService.getIp(ipAddressId);
        if (ip == null) {
            throw new InvalidParameterValueException("Unable to find ip address by id " + ipAddressId);
        }
        return ip;
    }
}
