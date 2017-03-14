## Node-RED integration with IBM Watson Content Hub

[![Build Status](https://travis-ci.org/ibm-wch/sample-node-red-contrib-wch.svg?branch=master)](https://travis-ci.org/ibm-wch/sample-node-red-contrib-wch)
[![npm version](https://badge.fury.io/js/node-red-contrib-watson-content-hub.svg)](https://badge.fury.io/js/node-red-contrib-watson-content-hub)
[![NPM Downloads](https://img.shields.io/npm/dt/node-red-contrib-watson-content-hub.svg)](https://www.npmjs.com/package/node-red-contrib-watson-content-hub)

This module provides a set of [Node-RED](http://nodered.org) nodes which integrate with
IBM Watson Content Hub. The main goal of these nodes is to make it even simpler
to integrate with IBM Watson Content Hub, as all [API][Content Hub API] calls
are nicely wrapped by the given nodes.


### Pre-requisites
There is no known pre-requisite, but this module was mainly tested on
Node-RED v0.16.2 and Node.js v4.2.1


### Installing
Run the following command in your Node-RED user directory
(typically ```~/.node-red```):

```
npm install node-red-contrib-watson-content-hub
```

Restart node-red and do a refresh in the browser editor UI, to see the newly installed nodes.

### Getting started

This section describes a very basic scenario how you can make sure the IBM Watson Content Hub integration with Node-RED is working. We assume the extension is installed as described earlier.

1. Go to the node-red editor UI (ie http://localhost:1880/)

2. Add an inject input node, a debug output node and a User node from the Watson_Content_Hub supportedActions

3. Wire the nodes as outlined on the picture

    ![Sample flow](https://raw.githubusercontent.com/ibm-wch/sample-node-red-contrib-wch/master/doc/images/flow.png)

4. Do a double-click on the Users node to enter the configuration dialog

    ![Config dialog](https://raw.githubusercontent.com/ibm-wch/sample-node-red-contrib-wch/master/doc/images/config.png)

5. Click on the edit icon on the Connection entry in the configuration dialog and add in your IBM ID credentials

    ![Config credentials](https://raw.githubusercontent.com/ibm-wch/sample-node-red-contrib-wch/master/doc/images/config_user.png)

    > __NOTE__ It is recommended to add a name whrioch makes it easier to identify the configuration

6. Select the Add button to submit your input

7. For the purpose of the getting started scenario we leave the Operation at the default (Retrieve the current user) and submit the configuration by hitting the Done button.

8. Finally select the deploy button in the upper right corner of the editor UI

9. Now we can test the flow by hitting the input trigger and we will find the User node result in the debug section of the editor UI.

### Features

This version provides Node-RED nodes for all API endpoints in IBM Watson Content
Hub. As this is  a very early version, there is not a full coverage of all REST
calls provided by IBM Watson Content Hub, but basic CRUD scenarios are implemented.

To get a better understanding how to work with the Node-RED nodes have a look
at the [examples folder](https://github.com/ibm-wch/sample-node-red-contrib-wch/tree/master/examples)

[Content Hub API]: https://developer.ibm.com/api/view/id-618:title-IBM_Watson_Content_Hub_API "IBM Watson Content Hub API"

### Adding IBM Watson Content Hub nodes to your IBM Bluemix Node-RED boilerplate

If you want to make use of this integration you have to run a Node-RED process somewhere. One very nice way to host this would be to use [IBM Bluemix](http://www.bluemix.net). This description provides you with the required steps on how you can add the IBM Watson Content Hub nodes into your existing Node-RED boilerplate.

1. Navigate to your [IBM Bluemix Dashboard](http://www.bluemix.net) and select the Node-RED boilerplate app

2. On the overview page look for a widget called __Continuous delivery__. Assuming your toolchain integration is not yet setup click on the Enable button and follow the steps in the wizard.

3. Now you should have a new [GitHub](http://github.com) repository which reflects your Node-RED boilerplate application.

4. Update the ```package.json``` and add the following entry to the ```dependencies``` section

    ```
"node-red-contrib-watson-content-hub":"0.x"
    ```

    > __NOTE:__ The position inside of the ```dependencies``` section does not matter, just pay attention to set the colon at the right position

5.  Commit your change and wait. Bluemix now gets informed about the change and your Node-RED boilerplate app gets restarted. This process may take up to 5 minutes, even if the application in your [IBM Bluemix Dashboard](http://www.bluemix.net) tells you it is started already.

> __ATTENTION__ Make sure your Node-RED application has a username and password set, because otherwise your IBM Watson Content Hub account is open to everybody.
