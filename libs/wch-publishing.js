/*******************************************************************************
 * Copyright (c) 2017 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

module.exports = function(request) {

    return {
        "cancel" : function(id) {
            return request("PUT","/publishing/v1/jobs/" + id + "/cancel",{"headers" : {"Content-Type" : "application/json"}})(
                {},
                {});
        },

        "create" : function() {
            return request("POST","/publishing/v1/jobs",{"headers" : {"Content-Type" : "application/json"}})(
                {},
                {});
        },

        "delete" : function(id) {
            return request("DELETE","/publishing/v1/jobs/" + id,{"headers" : {"Content-Type" : "application/json"}})(
                {},
                {});
        },

        "get" :  function(id) {
            return request("GET","/publishing/v1/jobs/"+id,{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },

        "all" :  function(fields,limit,offset) {
            return request("GET","/publishing/v1/jobs",{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },

        "status" :  function(id) {
            return request("GET","/publishing/v1/jobs/"+id+"/status",{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        }

    };

};
