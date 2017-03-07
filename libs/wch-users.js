
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

    function _currentUser() {
        return request("GET","/user-profile/v1/users/currentuser",{})({});
    }

    return {
        "current" : _currentUser,

        "get" : function(id) {
            return request("GET","/user-profile/v1/users/"+id,{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },

        "delete" : function(id) {
            return request("DELETE","/user-profile/v1/users/"+id,{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        },

        "all" : function() {
            return request("GET","/user-profile/v1/users",{"headers" : {"Content-Type" : "application/json"}})({},
                {});
        }


    };
};
