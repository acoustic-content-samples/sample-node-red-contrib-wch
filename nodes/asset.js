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

    function WCHAsset(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var context = {
            "context" : "asset",
            "supportedActions" : ["all","create","delete","get"],
            "node" : node,
            "config" : config,
            "create" : function(client,msg) {
                var context = wch_helper.resolveValue(msg,config.context || "asset");

                var asset_name = context.name;
                var asset_tags = context.tags;
                var asset_cat = context.categories;

                node.status({"fill":"green","shape":"dot","text":"creating asset " + asset_name});

                var type = mime.lookup(asset_name);

                var headers = {
                    "Content-Type" : type
                };

                var query = {"name":asset_name};

                if (msg.payload === undefined || !Buffer.isBuffer(msg.payload)) {
                    throw new Error ("Asset payload needs to be defined and of type Buffer");
                }

                client.resource.create(headers,query, msg.payload)
                    .then(function(data) {
                        var ctx = {
                            "resource": data.id,
                            "path": "/dxdam/" + asset_name,
                            "name": asset_name
                        };

                        if (asset_tags !== undefined) {
                            ctx.tags = {"values" : asset_tags};
                        }

                        if (asset_cat !== undefined) {
                            ctx.categoryIds = asset_cat;
                        }

                        client.asset.create({
                            "analyze": true
                        }, ctx).then(function(data) {
                            msg.payload = data;
                            node.send(msg);
                            node.status({});
                        });
                    });
            }
        };
        require('../dispatcher')(RED,context);
    }
    RED.nodes.registerType("wch-asset", WCHAsset);
};
