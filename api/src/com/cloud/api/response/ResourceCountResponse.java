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
package com.cloud.api.response;

import com.cloud.api.ApiConstants;
import com.cloud.utils.IdentityProxy;
import com.cloud.serializer.Param;
import com.google.gson.annotations.SerializedName;

@SuppressWarnings("unused")
public class ResourceCountResponse extends BaseResponse implements ControlledEntityResponse{
    @SerializedName(ApiConstants.ACCOUNT) @Param(description="the account for which resource count's are updated")
    private String accountName;
    
    @SerializedName(ApiConstants.PROJECT_ID) @Param(description="the project id for which resource count's are updated")
    private IdentityProxy projectId = new IdentityProxy("projects");
    
    @SerializedName(ApiConstants.PROJECT) @Param(description="the project name for which resource count's are updated")
    private String projectName;


    @SerializedName(ApiConstants.DOMAIN_ID) @Param(description="the domain ID for which resource count's are updated")
    private IdentityProxy domainId = new IdentityProxy("domain");

    @SerializedName(ApiConstants.DOMAIN) @Param(description="the domain name for which resource count's are updated")
    private String domainName;

    @SerializedName(ApiConstants.RESOURCE_TYPE) @Param(description="resource type. Values include 0, 1, 2, 3, 4. See the resourceType parameter for more information on these values.")
    private String resourceType;

    @SerializedName("resourcecount") @Param(description="resource count")
    private long resourceCount;

    @Override
    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    @Override
    public void setDomainId(Long domainId) {
        this.domainId.setValue(domainId);
    }

    @Override
    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public void setResourceCount(Long resourceCount) {
        this.resourceCount = resourceCount;
    }
    
    @Override
    public void setProjectId(Long projectId) {
        this.projectId.setValue(projectId);
    }

    @Override
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
    
}
