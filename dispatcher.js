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
module.exports = function(RED,node) {
    "use strict";

    node.node.on("input", _handleInput);

    function _handleInput(msg) {
        if(msg !== undefined) {
            var connection = RED.nodes.getNode(node.config.connection);

            var action = resolveAction(node.config,msg);
            if (node.supportedActions.indexOf(action) >= 0) {
                connection.connect().then(function(client) {
                    if (node[action] !== undefined) {
                        node[action](client,msg);
                    } else {
                        delegate(node)(client,msg);
                    }
                }).catch(function(error) {
                    handleError(node.node,"Error occured",error);
                });
            } else {
                displayError(node.node,
                             "Action [" + action + "] not implemented");
            }
        }
    }

    return {
        "resolveValue" : resolveValue
    };
};

function delegate(context) {
    return function closure(client,msg) {
        var node = context.node;
        var handler = client[context.context];
        if (handler !== undefined) {
            var action = resolveAction(context.config,msg);
            var method;

            var attr = context.config.attrId || context.context + ".id";
            var item_id = resolveValue(msg, attr);

            switch(action) {
                case 'all':
                case 'blank':
                case 'current':
                case 'elementsdefs':
                    method = handler[action];
                    if(method !== undefined) {
                        node.status({"fill":"green","shape":"dot","text":"loading items"});
                        method().then(function(data) {
                            handleSuccess(node,msg,data);
                        }).catch(function(error) {
                            handleError(node,"Error occured",error);
                        });
                    } else {
                        displayError(node,"Unable to resolve API handler");
                    }

                    break;
                case 'delete':
                case 'cancel':
                case 'children':
                case 'promote':
                case 'draft':
                case 'retire':
                case 'schema':
                case 'status':
                case 'get':
                    method = handler[action];

                    if(method !== undefined && item_id !== undefined) {
                        node.status({"fill":"green","shape":"dot","text":"processing " + item_id});
                        method(item_id).then(function(data) {
                            handleSuccess(node,msg,data);
                        }).catch(function(data) {
                            handleError(node,"Error occured",data);
                        });
                    } else {
                        displayError(node,"Missing context");
                    }
                    break;
                case 'create':
                    var createCtx = msg.payload;
                    if (context.transformInput) {
                        createCtx = context.transformInput(action,msg);
                    }

                    var cast;
                    if (createCtx instanceof Promise) {
                        cast = createCtx;
                    } else {
                        cast = Promise.resolve(createCtx);
                    }

                    cast.then(function(data) {
                        node.status({"fill":"green","shape":"dot","text":"creating " + context.context});
                        return handler.create(data).then(function(data) {
                            handleSuccess(node,msg,data);
                        });
                    }).catch(function(error) {
                        handleError(node,"Error occured",error);
                    });

                    break;
                case 'update':
                    if(item_id !== undefined) {
                        var updateCtx = msg.payload;
                        if (context.transformInput) {
                            updateCtx = context.transformInput(action,msg,item_id);
                        }

                        var delegate;
                        if (updateCtx instanceof Promise) {
                            delegate = updateCtx;
                        } else {
                            delegate = Promise.resolve(updateCtx);
                        }


                        node.status({"fill":"green","shape":"dot","text":"updating " + item_id});

                        delegate.then(function(data) {
                            handler.update(item_id,data).then(function(data) {
                                handleSuccess(node,msg,data);
                            });
                        }).catch(function(data) {
                            handleError(node,"Error occured",data);
                        });
                    } else {
                        displayError(node,"Missing context");
                    }
                    break;
                default:
                    displayError(node,
                                 "Action [" + action + "] not implemented");
                    break;
            }
        }
    };

}



function resolveAction(config,msg) {
    if (config.action === "topic") {
        return msg.topic;
    } else {
        return config.action;
    }
}

function handleError(node,message,error) {
    if (error) {
        node.error(error);
    }
    displayError(node,message,7000);
}

function handleSuccess(node,msg,data) {
    msg.payload = data;
    node.send(msg);
    node.status({});
}

function displayError(node,message,timeout) {
    var wait = timeout || 7000;
    node.status({"fill":"red","shape":"dot","text":message});
    setTimeout(function() {
        node.status({});
    },wait);
}

function resolveValue(obj,attr,defaultValue) {
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
