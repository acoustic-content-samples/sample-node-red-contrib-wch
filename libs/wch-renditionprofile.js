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

    function notimplemented() {
        console.log("not implemented yet");
    }

    return {
        "create" : function(req) {
            return request("POST","/authoring/v1/image-profiles",{"headers" : {"Content-Type" : "application/json"}})(
                req.query,
                req.body);
        },

        "update" : function(id,req) {
            return request("PUT","/authoring/v1/image-profiles/"+id,{"headers" : {"Content-Type" : "application/json"}})(
                req.query,
                req.body);
        },


        "delete" : function(id) {
            return request("DELETE","/authoring/v1/image-profiles/"+id,{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },

        "get" :  function(id,includes,fields) {
            return request("GET","/authoring/v1/image-profiles/"+id,{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },

        "all" :  function(fields,limit,offset) {
            return request("GET","/authoring/v1/image-profiles",{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },
    };
};
