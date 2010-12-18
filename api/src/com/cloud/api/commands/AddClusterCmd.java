package com.cloud.api.commands;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

import com.cloud.api.ApiConstants;
import com.cloud.api.BaseCmd;
import com.cloud.api.Implementation;
import com.cloud.api.Parameter;
import com.cloud.api.ServerApiException;
import com.cloud.api.response.HostResponse;
import com.cloud.api.response.ListResponse;
import com.cloud.exception.DiscoveryException;
import com.cloud.host.Host;

@Implementation(description="Adds a new cluster", responseObject=HostResponse.class)
public class AddClusterCmd extends BaseCmd {
    public static final Logger s_logger = Logger.getLogger(AddClusterCmd.class.getName());

    private static final String s_name = "addclusterresponse";
    
    @Parameter(name=ApiConstants.CLUSTER_NAME, type=CommandType.STRING, required=true, description="the cluster name")
    private String clusterName;

    @Parameter(name=ApiConstants.PASSWORD, type=CommandType.STRING, required=false, description="the password for the host")
    private String password;

    @Parameter(name=ApiConstants.POD_ID, type=CommandType.LONG, description="the Pod ID for the host")
    private Long podId;

    @Parameter(name=ApiConstants.URL, type=CommandType.STRING, required=false, description="the URL")
    private String url;

    @Parameter(name=ApiConstants.USERNAME, type=CommandType.STRING, required=false, description="the username for the cluster")
    private String username;

    @Parameter(name=ApiConstants.ZONE_ID, type=CommandType.LONG, required=true, description="the Zone ID for the cluster")
    private Long zoneId;
    
    @Parameter(name=ApiConstants.HYPERVISOR, type=CommandType.STRING, required=true, description="hypervisor type of the cluster")
    private String hypervisor;
    
    @Parameter(name=ApiConstants.CLUSTER_TYPE, type=CommandType.STRING, required=true, description="hypervisor type of the cluster")
    private String clusterType;
    
    
    public String getClusterName() {
        return clusterName;
    }

    public String getPassword() {
        return password;
    }

    public Long getPodId() {
        return podId;
    }

    public String getUrl() {
        return url;
    }

    public String getUsername() {
        return username;
    }

    public Long getZoneId() {
        return zoneId;
    }
    
    public String getHypervisor() {
    	return hypervisor;
    }
    
    @Override
    public String getCommandName() {
    	return s_name;
    }
    
    public String getClusterType() {
    	return clusterType;
    }
    
    public void setClusterType(String type) {
    	this.clusterType = type;
    }

    @Override
    public void execute(){
        try {
            List<? extends Host> result = _resourceService.discoverCluster(this);
            ListResponse<HostResponse> response = new ListResponse<HostResponse>();
            List<HostResponse> hostResponses = new ArrayList<HostResponse>();
            if (result != null) {
                for (Host host : result) {
                    HostResponse hostResponse = _responseGenerator.createHostResponse(host);
                    hostResponses.add(hostResponse);
                }
            } else {
                throw new ServerApiException(BaseCmd.INTERNAL_ERROR, "Failed to add host cluster");
            }

            response.setResponses(hostResponses);
            response.setResponseName(getCommandName());
            
            this.setResponseObject(response);
        } catch (DiscoveryException ex) {
            s_logger.warn("Exception: ", ex);
            throw new ServerApiException(BaseCmd.INTERNAL_ERROR, ex.getMessage());
        }
    }
}
