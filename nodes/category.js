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

module.exports = function(RED) {
    "use strict";

    function WCHCategory(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var context = {
            "context" : "category",
            "supportedActions" : ["all","create","children","delete","get","update"],
            "node" : node,
            "config" : config,

            "transformInput" : function(action,msg) {
                var context = wch_helper.resolveValue(msg,config.context || "category");

                var body = {"name" : context.name};
                if (context.parent !== undefined) {
                    body.parent = context.parent;
                }
                return {"body":body};
            }
        };
        require('../dispatcher')(RED,context);
    }
    RED.nodes.registerType("wch-category", WCHCategory);
};
