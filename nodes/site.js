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
var mime = require('mime-types');

module.exports = function(RED) {
    "use strict";

    function WCHSite(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var context = {
            "context" : "site",
            "supportedActions" : ["all","pages","deletePage","get"],
            "node" : node,
            "config" : config,
            "all" : function (client,msg) {
                client.site.all("default").then(function(data) {
                    msg.payload = data;
                    node.send(msg);
                });
            },
            "pages" : function (client,msg) {
                client.site.pages("default").then(function(data) {
                    msg.payload = data;
                    node.send(msg);
                });
            },
            "deletePage" : function (client,msg) {
                var context = wch_helper.resolveValue(msg,config.context || "site");
                client.site.pages("default",context.id).then(function(data) {
                    msg.payload = data;
                    node.send(msg);
                });
            }
        };

        require('../dispatcher')(RED,context);
    }
    RED.nodes.registerType("wch-site", WCHSite);
};
