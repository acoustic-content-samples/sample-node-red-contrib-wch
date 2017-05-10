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

var wch_helper = require('../wch-node-helper');
var Promise = require("bluebird");

module.exports = function(RED) {
    "use strict";

    function WCHConnection(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // This is used for doing internal testing
        var contenthuburl = config.apiurl || 'https://my.digitalexperience.ibm.com';
        if (process.env.CONTENTHUB !== undefined) {
            contenthuburl = process.env.CONTENTHUB;
        }

        var _client = require('../libs/wch-core')(contenthuburl);

        this.connect = function() {
            return _client.users.current().then(function(data) {
                var isLoginNeeded = false;
                if (data.roles !== undefined && data.roles.length > 0) {
                    for (var idx in data.roles) {
                        if (data.roles[idx] === "anonymous") {
                            isLoginNeeded = true;
                            break;
                        }
                    }
                } else {
                    isLoginNeeded = true;
                }

                if (isLoginNeeded) {
                    throw new Error("Looks like the session is timed out");
                }

                node.log("Session is still active");
                return _client;
            }).catch(function() {
                node.log("Login user to Watson Content Hub");
                return _client.login(node.credentials.user,
                                     node.credentials.password,
                                     config.tenantid)
                    .then(function(data) {
                        node.log("Successfully login user to Watson Content Hub",JSON.stringify(data));
                        return _client;
                    }).catch(function(data) {
                        node.error(data);
                        return Promise.reject("Failed to login user to Watson Content Hub");
                    });
            });
        };

        this.client = function() {
            return _client;
        };

    }

    RED.nodes.registerType("wch-connection", WCHConnection,
        { "credentials": {
            "user": {type:"text"},
            "password": {type:"password"}
            }
        }
    );

    RED.httpAdmin.get('/wch/types/',function(req,res) {
        var connection = RED.nodes.getNode(req.query.conn);
        connection.connect().then(function(client) {
            return client.type.all().then(function(data) {
                res.send(data);
            });
        }) .catch(function(error) {
            res.send(error);
        });
    });
};
