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

    function WCHContent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var connection = RED.nodes.getNode(config.connection);

        var context = {
            "context" : "content",
            "supportedActions" : ["all","create","delete","get","update","draft","promote","retire"],
            "node" : node,
            "config" : config,
            "transformInput" : function(action,msg,item_id) {
                var context = wch_helper.resolveValue(msg,config.context || "content");

                var base;
                if (action === "update") {
                    base = connection.client().content.get(item_id);
                } else {
                    base = Promise.resolve({});
                }

                return base.then(function(body) {
                    if (context.name !== undefined) {
                        body.name = context.name;
                    }

                    if (action !== "update") {
                        if (context.typeId !== undefined) {
                            body.typeId = context.typeId;
                        } else {
                            body.typeId = config.typeId;
                        }
                    }

                    if (context.tags !== undefined) {
                        body.tags = context.tags;
                    }

                    if (context.locale !== undefined) {
                        body.locale = context.locale;
                    }

                    return handleElements(node,connection.client(),context.elements,body,msg);
                });
            }
        };
        require('../dispatcher')(RED,context);
    }
    RED.nodes.registerType("wch-content", WCHContent);
};

function handleElements(node,client,elements,result,msg) {
    var transformed = result.elements || {};

    if (elements !== undefined) {
        return client.type.get(result.typeId).then(function(data) {
            if (data.schema.properties !== undefined) {
                var props = data.schema.properties;
                var handler = [];

                for (var attrName in elements) {
                    var elementName = attrName;
                    var elementValue = elements[attrName];

                    if (elementValue instanceof Object &&
                        elementValue.elementType !== undefined) {
                        // We assume now that the content of the element
                        // input is what the WCH API expects
                        transformed[elementName] = elementValue;
                    } else {
                        if (props[attrName] !== undefined) {
                            var elementType = props[attrName];

                            switch(elementType.properties.elementType.default) {
                                case "datetime":
                                case "number":
                                case "text":
                                case "toggle":
                                    handler.push(handleSimpleType(client,
                                        elementName,
                                        elementValue,
                                        transformed,
                                        elementType.properties.elementType.default));
                                    break;
                                case "location":
                                    handler.push(handleLocation(client,
                                        elementName,
                                        elementValue,
                                        transformed,
                                        elementType.properties.elementType.default));
                                    break;
                                case "link":
                                    handler.push(handleLink(client,
                                        elementName,
                                        elementValue,
                                        transformed,
                                        elementType.properties.elementType.default));
                                    break;
                                case "category":
                                    handler.push(handleCategories(client,
                                        elementName,
                                        elementValue,
                                        transformed,
                                        elementType.properties.elementType.default));
                                    break;
                                case "image":
                                    handler.push(handleImage(client,
                                        elementName,
                                        elementValue,
                                        transformed));
                                    break;
                            }
                        }
                    }
                }
                return Promise.all(handler).then(function(data) {
                    result.elements = transformed;
                    return {"body":result};
                });
            }
        });
    } else {
        return {"body":result};
    }
}

function handleSimpleType(client,elementName,value,result,type) {
    result[elementName] = {"value" : value, "elementType" : type};
    return;
}

function handleLink(client,elementName,value,result,type) {
    result[elementName] = {"linkURL" : value, "elementType" : type};
    return;
}

function handleLocation(client,elementName,value,result,type) {
    console.log(elementName);
    console.log(value);
    console.log(result);
    console.log(type);
    result[elementName] = {"latitude" : value.latitude, "longitude" : value.longitude, "elementType" : type};
    return;
}

function handleCategories(client,elementName,value,result,type) {
    if (Array.isArray(value)) {
        result[elementName] = {"categoryIds" : value, "elementType" : type};
    } else {
        result[elementName] = {"categoryIds" : [value], "elementType" : type};
    }
    return;
}

function handleImage(client,elementName,assetID,result) {
    return client.asset.get(assetID).then(function (data) {
        result[elementName] = {
            "asset" : {
                "id" : data.id,
                "resourceUri":"/authoring/v1/resources/" + data.resource,
                "fileName":data.fileName,
                "fileSize":data.fileSize,
                "mediaType":data.mediaType},
            "renditions" : data.renditions,
            "elementType" : "image"};


        if (result[elementName].renditions !== undefined) {
            for (var attrName in result[elementName].renditions) {
                if (result[elementName].renditions[attrName].renditionId === undefined) {
                    result[elementName].renditions[attrName].renditionId =
                        result[elementName].renditions[attrName].id;
                }
                delete result[elementName].renditions[attrName].id;
            }
        }

        return;
    }).catch(function(error) {
        throw new Error("Unable to retrieve asset " + assetID);
    });
}

function isString(str) {
   return typeof(str) == 'string' || str instanceof String;
}
