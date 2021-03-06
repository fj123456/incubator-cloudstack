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
package com.cloud.agent.api.storage;

import com.cloud.storage.Storage.ImageFormat;


/**
 *
 */
public class PrimaryStorageDownloadCommand extends AbstractDownloadCommand {
	String localPath;
	String poolUuid;
	long poolId;
	
	String secondaryStorageUrl;
	String primaryStorageUrl;

    protected PrimaryStorageDownloadCommand() {
	}

    public PrimaryStorageDownloadCommand(String name, String url, ImageFormat format, long accountId, long poolId, String poolUuid, int wait) {
        super(name, url, format, accountId);
        this.poolId = poolId;
        this.poolUuid = poolUuid;
        setWait(wait);
    }
   
    public String getPoolUuid() {
        return poolUuid;
    }
    
    public long getPoolId() {
        return poolId;
    }
    
    public void setLocalPath(String path) {
    	this.localPath = path;
    }
    
    public String getLocalPath() {
    	return localPath;
    }
    
    public void setSecondaryStorageUrl(String url) {
    	secondaryStorageUrl = url;
    }
    
    public String getSecondaryStorageUrl() {
    	return secondaryStorageUrl;
    }
    
    public void setPrimaryStorageUrl(String url) {
    	primaryStorageUrl = url;
    }
    
    public String getPrimaryStorageUrl() {
    	return primaryStorageUrl;
    }
    
    @Override
    public boolean executeInSequence() {
        return true;
    }
}
