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

/*
 * EXPORT THE NODE_RED NODES
 *
 *  "wch-type": "nodes/type.js",
 */
module.exports = function(RED) {
    "use strict";

    function WCHType(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var connection = RED.nodes.getNode(config.connection);


        var context = {
            "context" : "type",
            "supportedActions" : ["all","blank","create","delete","elementsdefs","get","schema","update"],
            "node" : node,
            "config" : config,

            "transformInput" : function(action,msg,id) {
                    var context = wch_helper.resolveValue(msg,config.context || "type");

                    var base;
                    if (action === "update" && id !== undefined) {
                        base = connection.client().type.get(id);
                    } else {
                        base = connection.client().type.blank();
                    }

                    return Promise.all([base,connection.client().type.elementsdefs()])
                        .then(function(data) {
                            var body = data[0];
                            if (context.name !== undefined) {
                                body.name = context.name;
                            } else {
                                body.name = "Node-RED";
                            }

                            handleElements(msg,context.elements,body,data[1]);

                            return {"body" : body};
                        });
            },

        };
        require('../dispatcher')(RED,context);

    }

    RED.nodes.registerType("wch-type", WCHType);
};

function handleElements(msg,elements,result,definitions) {
    if (elements !== undefined) {
        for (var elemName in elements) {
            var elem = elements[elemName];
            for (var idx2 in definitions.items) {
                if (elem.type === definitions.items[idx2].name) {
                    /*jshint -W069 */
                    var schemaTemplate = JSON.stringify(definitions.items[idx2].schemaFragment["$ELEMENT_KEY$"]);
                    /*jshint +W069 */
                    schemaTemplate = schemaTemplate.replace(/\$ELEMENT_KEY\$/g, elemName);
                    schemaTemplate = schemaTemplate.replace(/\$ELEMENT_LABEL\$/g, elem.title || elemName);
                    result.schema.properties[elemName] = JSON.parse(schemaTemplate);

                    if (elem.imageProfileId !== undefined) {
                        result.schema.properties[elemName].properties.imageProfileId =
                            elem.imageProfileId;
                    }


                    var formFragment = JSON.stringify(definitions.items[idx2].formFragment);
                    formFragment = formFragment.replace(/\$ELEMENT_KEY\$/g, elemName);
                    formFragment = formFragment.replace(/\$ELEMENT_LABEL\$/g, elem.title || elemName);

                    result.form.push(JSON.parse(formFragment));
                }
            }
        }
    }
}
