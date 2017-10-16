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

var _ = require('lodash');

var Promise = require("bluebird");

// REST API documentation can be found here
// https://developer.ibm.com/api/view/id-618:title-IBM_Watson_Content_Hub_API#Createnewtypedocuments.

/*
 * This class maintains the authentication and basic REST communication logic.
 * The individual rest calls are maintained in the sublibraries (wch-*.js)
 */
module.exports = function(url,opts) {
    var rp = require('request-promise');

    var asset = require('./wch-asset');
    var users = require('./wch-users');
    var type = require('./wch-type');
    var content = require('./wch-content');
    var search = require('./wch-search');
    var resource = require('./wch-resource');
    var category = require('./wch-category');
    var renditionprofile = require("./wch-renditionprofile");
    var publishing = require("./wch-publishing");
    var site = require("./wch-site");

    opts = opts || {};

    var cookieJar = rp.jar();

    var baseOptions = {
        url: url.replace(/\/$/, ''),
        useQuerystring: true,
        json: true
    };

    if (process.env.NODERED_PROXY !== undefined) {
        /*jshint -W069 */
        baseOptions["proxy"] = process.env.NODERED_PROXY;
        /*jshint +W069 */
    }

    _.assign(baseOptions, _.omit(opts, 'logTime'));

    function makeRequest(method, path, addOptions) {
        return function closure(query, body) {
            var requestOptions = _.cloneDeep(baseOptions);

            requestOptions.method = method;
            requestOptions.qs = query;
            requestOptions.jar = cookieJar;
            requestOptions.url = requestOptions.url + path;

            if (addOptions) {
                requestOptions = _.extend(requestOptions, addOptions);
            }
            requestOptions.body = body;
            return rp(requestOptions);
        };
    }

    function login(username,password,tenant) {
        var headers = {
            "Authorization" : 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        };

        if (tenant !== undefined && tenant.length > 0) {
            headers["x-ibm-dx-tenant-id"] = tenant;
        }

        return makeRequest("GET","/login/v1/basicauth",{"headers":headers,"resolveWithFullResponse": true})({})
            .then(function(response) {
                // console.log(JSON.stringify(response,null,4))
                if (tenant !== undefined && tenant.length > 0) {
                    // TODO, this should come from the body
                    baseOptions.url = response.headers['x-ibm-dx-tenant-base-url'];
                } else {
                    baseOptions.url = response.body[0].baseUrl;
                }
                return Promise.resolve(response.body);
            });
    }

    function logout() {
        // TODO find a way to flush the cookie store
    }

    return {
        "login" : login,
        "logout" : logout,

        "asset" : asset(makeRequest),
        "category" : category(makeRequest),
        "content" : content(makeRequest),
        "site" : site(makeRequest),
        "profile" : renditionprofile(makeRequest),
        "publishing" : publishing(makeRequest),
        "resource" : resource(makeRequest),
        "type" : type(makeRequest),
        "search" : search(makeRequest),
        "users" : users(makeRequest)
    };

};
