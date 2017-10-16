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

/*
 * EXPORT THE NODE_RED NODES
 */
module.exports = function(RED) {
    "use strict";
    function WCHSearch(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var context = {
            "context" : "search",
            "supportedActions" : ["search"],
            "node" : node,
            "config" : config,

            "search" : function(client,msg) {
                node.status({"fill":"green","shape":"dot","text":"Fetching data"});
                client.search.search(msg.search_query).then(function(data) {
                    if (config.as === "multi") {
                        msg.payload = data;
                        var elements = data.documents || [];
                        for (var idx=0;idx < elements.length; idx++) {
                            // add support for the join node
                            var parts = {"id" : node.id,
                                         "type" : "array",
                                         "count" : elements.length,
                                         "index" : idx};

                            node.send([undefined,{"payload":elements[idx], "parts":parts}]);
                        }
                        node.send(msg);
                    } else {
                        msg.payload = data;
                        node.send(msg);
                    }
                    node.status({});
                }).catch(function(data) {
                    node.status({});
                    node.error(data);
                });
            }
        };
        require('../dispatcher')(RED,context);
    }
    RED.nodes.registerType("wch-search", WCHSearch);

};
