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
import com.cloud.async.AsyncJob;
import com.cloud.event.EventTypes;
import com.cloud.storage.Snapshot;
import com.cloud.user.Account;
import com.cloud.user.UserContext;

@Implementation(description="Deletes a snapshot of a disk volume.", responseObject=SuccessResponse.class)
public class DeleteSnapshotCmd extends BaseAsyncCmd {
    public static final Logger s_logger = Logger.getLogger(DeleteSnapshotCmd.class.getName());
    private static final String s_name = "deletesnapshotresponse";

    /////////////////////////////////////////////////////
    //////////////// API parameters /////////////////////
    /////////////////////////////////////////////////////

    @IdentityMapper(entityTableName="snapshots")
    @Parameter(name=ApiConstants.ID, type=CommandType.LONG, required=true, description="The ID of the snapshot")
    private Long id;


    /////////////////////////////////////////////////////
    /////////////////// Accessors ///////////////////////
    /////////////////////////////////////////////////////

    public Long getId() {
        return id;
    }

    /////////////////////////////////////////////////////
    /////////////// API Implementation///////////////////
    /////////////////////////////////////////////////////

    @Override
    public String getCommandName() {
        return s_name;
    }

    @Override
    public long getEntityOwnerId() {
        Snapshot snapshot = _entityMgr.findById(Snapshot.class, getId());
        if (snapshot != null) {
            return snapshot.getAccountId();
        }

        return Account.ACCOUNT_ID_SYSTEM; // no account info given, parent this command to SYSTEM so ERROR events are tracked
    }

    @Override
    public String getEventType() {
        return EventTypes.EVENT_SNAPSHOT_DELETE;
    }

    @Override
    public String getEventDescription() {
        return  "deleting snapshot: " + getId();
    }
    
    public AsyncJob.Type getInstanceType() {
    	return AsyncJob.Type.Snapshot;
    }
    
    public Long getInstanceId() {
    	return getId();
    }

    @Override
    public void execute(){
        UserContext.current().setEventDetails("Snapshot Id: "+getId());
        boolean result = _snapshotService.deleteSnapshot(getId());
        if (result) {
            SuccessResponse response = new SuccessResponse(getCommandName());
            this.setResponseObject(response);
        } else {
            throw new ServerApiException(BaseCmd.INTERNAL_ERROR, "Failed to delete snapshot");
        }
    }
}
