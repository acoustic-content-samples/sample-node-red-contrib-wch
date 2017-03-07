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

module.exports = {

    "handleOptionAll" : function(node, handler, msg) {
        node.status({"fill":"green","shape":"dot","text":"fetching all items"});
        handler.all().then(function(data) {
            msg.payload = data;
            node.send(msg);
            node.status({});
        });
    },

    "handleOptionGet" : function(node, handler, msg, id) {
        node.status({"fill":"green","shape":"dot","text":"retrieving item " + id});
        handler.get(id).then(function(data) {
            msg.payload = data;
            node.send(msg);
            node.status({});
        }).catch(function(data) {
            node.error(error);
        });
    },

    "handleOptionDelete" : function(node, handler, msg, id) {
        node.status({"fill":"green","shape":"dot","text":"deleting item " + id});
        handler.delete(id).then(function(data) {
            msg.payload = data;
            node.send(msg);
            node.status({});
        }).catch(function(data) {
            node.error(error);
        });
    },

    "handleError" : function(node,message,timeout) {
        node.status({"fill":"red","shape":"dot","text":message});
        setTimeout(function() {
            node.status({});
        },timeout);
    },

    "notimplemented" : function(node) {
        node.status({"fill":"red","shape":"dot","text":"This function is not yet implemented"});
    },

    "resolveAction" : function(node,config,msg) {
        if (config.action === "topic") {
            return msg.topic;
        } else {
            return config.action;
        }
    },

    "getConfig" : function(config,name,defaultValue) {
        return config[name] || defaultValue;
    },

    "resolveValue" : function(obj,attr,defaultValue) {
        var temp = obj;
        var elements = attr.split('.');
        for (var idx in elements) {
            if (temp[elements[idx]] !== undefined) {
                temp = temp[elements[idx]];
            } else {
                return defaultValue;
            }
        }
        return temp;
    }

};
