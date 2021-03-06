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
package com.cloud.agent.api.routing;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.cloud.agent.api.to.FirewallRuleTO;

/**
 * 
 * AccessDetails allow different components to put in information about
 * how to access the components inside the command.
 */
public class SetFirewallRulesCommand extends NetworkElementCommand {
    FirewallRuleTO[] rules;

    protected SetFirewallRulesCommand() {
    }
    
    public SetFirewallRulesCommand(List<FirewallRuleTO> rules) {
        this.rules = rules.toArray(new FirewallRuleTO[rules.size()]); 
    }
    
    public FirewallRuleTO[] getRules() {
        return rules;
    }

	public String[][] generateFwRules() {
		String [][] result = new String [2][];
		Set<String> toAdd = new HashSet<String>();

		
		for (FirewallRuleTO fwTO: rules) {
		/* example  :  172.16.92.44:tcp:80:80:0.0.0.0/0:,200.16.92.44:tcp:220:220:0.0.0.0/0:, 
		 *  each entry format      <ip>:protocol:srcport:destport:scidr:
		 *  reverted entry format  <ip>:reverted:0:0:0:
		 */
			if (fwTO.revoked() == true) 
			{
				StringBuilder sb = new StringBuilder();
				/* This entry is added just to make sure atleast there will one entry in the list to get the ipaddress */
				sb.append(fwTO.getSrcIp()).append(":reverted:0:0:0:"); 
				String fwRuleEntry = sb.toString();
				toAdd.add(fwRuleEntry);
				continue;
			}
			
			List<String> cidr;
			StringBuilder sb = new StringBuilder();
			sb.append(fwTO.getSrcIp()).append(":").append(fwTO.getProtocol()).append(":");
			if ("icmp".compareTo(fwTO.getProtocol()) == 0)
			{
				sb.append(fwTO.getIcmpType()).append(":").append(fwTO.getIcmpCode()).append(":");
				
			}else if (fwTO.getStringSrcPortRange() == null)
				sb.append("0:0").append(":");
			else
			    sb.append(fwTO.getStringSrcPortRange()).append(":");
			
			cidr = fwTO.getSourceCidrList();
			if (cidr == null || cidr.isEmpty())
			{
				sb.append("0.0.0.0/0");
			}else{
				Boolean firstEntry = true;
	            for (String tag : cidr) {
	            	if (!firstEntry) sb.append("-"); 
	        	   sb.append(tag);
	        	   firstEntry = false;
	            }
			}
			sb.append(":");
			String fwRuleEntry = sb.toString();
		
			toAdd.add(fwRuleEntry);
			
		}
		result[0] = toAdd.toArray(new String[toAdd.size()]);
		
		return result;
	}
}
