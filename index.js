
'use strict'; 

var vendor = require('vendor');


// HELPERS

/**
 * Note
 * The specification says:
 * > When using promises rejection reasons should always be instances of the ECMAScript Error type such as DOMException 
 * > or the built in ECMAScript error types.
 * @see https://www.w3.org/TR/tcp-udp-sockets/#h-sotd
 *
 * Browsers do not provide always DOMException as a constructor, so in these caseswe are using ECMAScript Error with the
 * right DOMException properties 
 **/ 

/**
 * @private
 */
var createException = (function createExceptionGenerator() {
    var Constructor;
    try {
        Constructor = new DOMException("is_supported");
        // if no thrown error we can use DOMException as a constructor
        Constructor = DOMException;
    } catch (e) {
        Constructor = Error;
    }
    return function createException(name, code, message) {
        var exception;
        message = typeof message === 'string' ? message : JSON.stringify(message);
        exception = new Constructor(message);    
        exception.name = name;
        exception.code = code;
        return exception;
    };
})();
createException.INVALID_ACCESS_ERR = DOMException && DOMException.INVALID_ACCESS_ERR || 15;
createException.SECURITY_ERR = DOMException && DOMException.SECURITY_ERR || 18;
createException.NETWORK_ERR = DOMException && DOMException.NETWORK_ERR || 19;
createException.ABORT_ERR = DOMException && DOMException.ABORT_ERR || 20;

/**
 * @private
 */
function InvalidAccessError(message) {
    return createException('InvalidAccessError', createException.INVALID_ACCESS_ERR, message);
}

/**
 * @private
 */
function SecurityError(message) {
    return createException('SecurityError', createException.SECURITY_ERR, message);
}

/**
 * @private
 */
function NetworkError(message) {
    return createException('NetworkError', createException.NETWORK_ERR, message);
}

/**
 * @private
 */
function AbortError(message) {
    return createException('AbortError', createException.ABORT_ERR, message);
}

/**
 * @private
 */
function isValidAddress(address) {
    // TODO: check address validity (host or IPV4 or IPV6)
    return Boolean(address);
}

/**
 * @private
 */
function isValidPortNumber(port) {
    // very basic control
    // TODO: check system ephemeral port range to exclude
    return port < 65535;
}


// ENUMS

/**
 * TCPUDPPermissionState
 * @see https://www.w3.org/TR/tcp-udp-sockets/#tcpudppermissionstate
 **/
var TCPUDPPermissionState = {
    // The webapp has permission to use the requested interface.
    GRANTED: 'granted',
    // The webapp has been denied permission to use the requested interface.
    DENIED: 'denied',
    // The webapp needs to request permission to use the requested interface by calling requestPermission.
    PROMPT: 'prompt'
};

/**
 * SocketReadyState
 * @see https://www.w3.org/TR/tcp-udp-sockets/#socketreadystate
 **/
var SocketReadyState = {
    // The socket is in opening state,
    // i.e. availability of local address/port is being checked, network status is being checked, etc.
    OPENING: "opening",
    // The socket is ready to use to send and received data.
    OPEN: "open",
    // The socket is closed and can not be use to send and received data
    CLOSED: "closed"
};


// DICTIONARIES

/**
 * The UDPMessage dictionary represents UDP data including address and port of the remote peer. 
 * The field data is mandatory but remoteAddress and remotePort are optional.
 * 
 * @class UDPMessage
 * @param {ArrayBuffer} data Received UDP data or UDP data to send. 
 * @param {string} remoteAddress The address of the remote machine. 
 * @param {number} remotePort The port of the remote machine. 
 * @see https://www.w3.org/TR/tcp-udp-sockets/#idl-def-UDPMessage
 */
function UDPMessage (data, remoteAddress, remotePort) {
    this.data = data;
    this.remoteAddress = remoteAddress;
    this.remotePort = remotePort;
}


/**
 * States the options for the UDPSocket. 
 * An instance of this dictionary can optionally be used in the constructor of the UDPSocket object, 
 * where all fields are optional.
 * 
 * @class UDPOptions
 * @param {string} localAddress The address of the local machine. 
 * @param {number} localPort The port of the local machine. 
 * @param {string} remoteAddress The address of the remote machine. 
 * @param {number} remotePort The port of the remote machine. 
 * @param {string} addressReuse Bound socket to a local address/port pair that already is in use
 * @param {boolean} loopback Loop sent multicast data back to the sender
 * @see https://www.w3.org/TR/tcp-udp-sockets/#idl-def-UDPMessage
 */
function UDPOptions (localAddress, localPort, remoteAddress, remotePort, addressReuse, loopback) { // jshint ignore:line
    // The IPv4/6 address of the local interface, e.g. wifi or 3G, that the UDPSocket object is bound to. 
    // If the field is omitted, the user agent binds the socket to an IPv4/6 address based on the routing table 
    // and possibly a preselect default local interface to use for the selected remoteAddress if this member is present. 
    // Else the UDPSocket is unbound to a local interface.
    this.localAddress  = localAddress ;
    // The local port that the UDPSocket object is bound to. 
    // If the the field is omitted, the user agent binds the socket to a an ephemeral local port decided by the system.
    this.localPort  = localPort ;
    // 
    this.remoteAddress = remoteAddress;
    //
    this.remotePort = remotePort;
    // true allows the socket to be bound to a local address/port pair that already is in use. Default is true.
    this.addressReuse = addressReuse;
    // Only applicable for multicast. true means that sent multicast data is looped back to the sender. Default is false.
    this.loopback = loopback;
}

/**
 * States the options for the webapp to get status of permission for creating a UDPSocket object or to request
 * permission to create a UDPSocket object.
 *
 * An instance of this dictionary can optionally be used as argument to the UDPPermission hasPermission and
 * requestPermission methods.
 *
 * All fields are optional.
 *
 * @class UDPPermissionOptions
 * @param {string} localAddress The address of the local machine. 
 * @param {number} localPort The port of the local machine. 
 * @param {string} remoteAddress The address of the remote machine. 
 * @param {number} remotePort The port of the remote machine. 
 * @see https://www.w3.org/TR/tcp-udp-sockets/#dictionary-udppermissionoptions
 */
function UDPPermissionOptions(localAddress, localPort, remoteAddress, remotePort) { // jshint ignore:line

    /**
     * The local interface that the webapp requests permission for the UDPSocket object to be bound to.
     * If the field is omitted the webapp does not request permission to use any specific local interface,
     * i.e. the user agent selects local interface.
     *
     * @type {string}
     */
    this.localAddress = localAddress;
    
    /**
     * The local port that the webapp requests permission for the UDPSocket object to be bound to.
     * If the field is omitted the webapp does not request permission to use any specific local port,
     * i.e. the user agent selects local port.
     *
     * @type {number}
     */
    this.localPort = localPort;
    
    /**
     * The host name or IPv4/6 address the webapp requests permission for the UDPSocket object
     * to send UDP packets to.
     * If the field is omitted it means that the webapp requests permission for the UDPSocket object
     * to send UDP packets to any peer.
     *
     * @type {string}
     */
    this.remoteAddress = remoteAddress;
    
    /**
     * The port of the peer the webapp requests permission for the UDPSocket object to send UDP packets to.
     * If the field is omitted it means that the webapp requests permission for the UDPSocket object
     * to send UDP packets to any port.
     *
     * @type {number}
     */
    this.remotePort = remotePort;
}



// INTERFACES


/**
 * This interface exposes methods related to the permission to access the UDPSocket interface. Permission could be
 * given based on user consent, based on trust for the webapp, e.g. related to the origin of it and verified through
 * web security mechanisms such as secure transport and signatures, based on previously granted or denied permission
 * explicitly for this webapp or a combination of these mechanisms.
 *
 * @class UDPPermission
 * @see https://www.w3.org/TR/tcp-udp-sockets/#udppermission-interface
 */
function UDPPermission() {

    if (this instanceof UDPPermission) {
        throw new Error('The UDPPermission interface should not be used as constructor');
    }

    /**
     * Creates a permission options token to retrieve existing ones
     * 
     * @private 
     * @method createPermissionOptionsKey
     * @param {UDPPermissionOptions} udpPermissionOptions
     * @returns {string}
     */
    function createPermissionOptionsKey(udpPermissionOptions){
        var u = udpPermissionOptions;
        return [
            u.localAddress, ':', u.localPort,
            '/',
            u.remoteAddress, ':', u.remotePort
        ].join('');
    }

    /**
     * Ask User permission to create the socket
     * 
     * @private
     * @method confirm
     * @param {UDPPermissionOptions} udpPermissionOptions
     * @returns {boolean}
     */
    function confirm(udpPermissionOptions) {
        // todo: check permission in application settings
        // todo: ask permission to the user if not found in settings
        return true;
    }

    /**
     * Retrieves the permission state (TCPUDPPermissionState) of the requesting webapp for creating a UDPSocket object.
     * The method returns a Promise, which is resolved with the permission state as argument.
     *
     * @method hasPermission
     * @param {UDPPermissionOptions} [udpPermissionOptions] Options for the permission state request. If omitted, interpreted as when all dictionary fields are ommitted.
     * @returns {Promise<UDPPermissionOptions>}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPPermission-hasPermission-Promise-TCPUDPPermissionState--UDPPermissionOptions-udpPermissionOptions
     */
    this.hasPermission = function (udpPermissionOptions) {
        var 
            udpPermissionPromise, 
            key, 
            permissionState;

        // step 1
        // Create a new Promise, udpPermissionPromise, return it and run the remaining steps asynchronously.
        udpPermissionPromise = new Promise(function (resolve, reject) {

            // step 2
            // Retrieve the permission state of the requesting webapp for creating a UDPSocket object according to the udpPermissionOptions argument.
            key = createPermissionOptionsKey(udpPermissionOptions || {});
            permissionState = TCPUDPPermissionState[key] || TCPUDPPermissionState.PROMPT;

            // step 3
            // If there is an error, reject udpPermissionPromise with no arguments and abort the remaining steps
            //// No Way to have errors....

            // step 4
            // When the request has been completed, resolve udpPermissionPromise with TCPUDPPermissionState providing the permission state.
            resolve(permissionState);
        });
        return udpPermissionPromise;
    };

    /**
     * Requests permission to create a UDPSocket object. The method returns a Promise, 
     * which is resolved if permission was given and rejected if permission was denied.
     *
     * @method requestPermission
     * @param {UDPPermissionOptions} [udpPermissionOptions] Options for the permission request. If omitted, interpreted as when all dictionary fields are ommitted.
     * @returns {Promise<void>}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPPermission-requestPermission-Promise-void--UDPPermissionOptions-udpPermissionOptions
     */
    this.requestPermission = function (udpPermissionOptions) {
        var 
            udpRequestPermissionPromise, 
            key;

        key = createPermissionOptionsKey(udpPermissionOptions || {});

        // step 1
      
        udpRequestPermissionPromise = new Promise(function (resolve, reject) {
            var 
                step2, 
                step3, 
                step4, 
                step5;

          
            // HELPERS

            function rejectUdpRequestPermissionPromiseWithSecurityError(message) {
                TCPUDPPermissionState[key] = TCPUDPPermissionState.DENIED;
                reject(SecurityError(message));
            }

            function resolveUdpRequestPermissionPromise() {
                TCPUDPPermissionState[key] = TCPUDPPermissionState.GRANTED;
                resolve();
            }

            
            // step 2
          
            // If the requesting webapp is denied to create a UDPSocket object that sends UDP packets to the
            // requested remote address and port 
            
            step2 = vendor.checkCreateRemotePermission(
                udpPermissionOptions.remoteAddress,
                udpPermissionOptions.remotePort
            );
          
            // reject tcpRequestPermissionPromise with DOMException
            // "SecurityError" and abort the remaining steps.
						
            step2.catch(function (error) {
                throw SecurityError(error);
            });

            
            // step 3
            
            // If the requesting webapp is denied to create a UDPSocket object that binds to the requested
            // local address and port 
            
            step3 = step2.then(function (ok) {
                return vendor.checkCreateLocalPermission(
                    udpPermissionOptions.localAddress,
                    udpPermissionOptions.localPort
                );
            });
            
            // reject tcpRequestPermissionPromise with DOMException "SecurityError" and
            //   abort the remaining steps.
            
            step3.catch(rejectUdpRequestPermissionPromiseWithSecurityError);

          
            // step 4
          
            // If the requesting webapp is allowed to create a UDPSocket object without user interaction,
            //   e.g. based on a prearranged trust relationship or the user has already granted permission
            //   explicitly for this webapp, 

            step4 = step3.then(function (ok) {
                return vendor.checkCreatePermissionFromSettings(
                    udpPermissionOptions
                );
            });
          
            // resolve udpRequestPermissionPromise and abort the remaining steps.
          
            step4.then(resolveUdpRequestPermissionPromise);

          
            // step 5
          
            // Request user consent to create a UDPSocket object.

            step5 = step4.catch(function () {
                confirm('UDPSocket.create', udpPermissionOptions);
            });

          
            // step 6
          
            // If permission was granted, resolve udpRequestPermissionPromise and abort the remaining steps.

            step5.then(resolveUdpRequestPermissionPromise);

          
            // step 7
          
            // If permission was not granted, reject udpRequestPermissionPromise with DOMException "SecurityError".

            step5.catch(rejectUdpRequestPermissionPromiseWithSecurityError);

        });
        return udpRequestPermissionPromise;
    };
}



/**
 * The UDPSocket interface defines attributes and methods for UDP communication
 * 
 * @class UDPSocket
 * @constructor
 * @param {UDPOptions} [options]
 * @see https://www.w3.org/TR/tcp-udp-sockets/#interface-udpsocket
 */
function UDPSocket(options) {

    var
        /**
         * Private members
         */
        mySocket, // Copy of "this" for callbacks
        vendorDatagramSocket, // Reference to the vendor UDP socket
        readyState, // Inner SocketReadyState (OPENING, OPEN, CLOSED)
        
        /**
         * Inner Promise Resolvers and Rejecters 
         * */
        openedResolver, 
        openedRejecter,
        closedResolver, 
        closedRejecter,
    
        /**
         * UDPSocket Constructor Specification Steps
         */
        step1,  // Create the local & vendor UDP Socket
        step2,  // Check Webapp UDP Socket Permission
        step3,  // Configure the Remote Address
        step4,  // Configure the Remote Port
        step5,  // Configure the Local Address
        step6,  // Configure the Local Port
        step7,  // Handle the addressReuse option
        step8,  // Handle the loopback Multicast option
        step9,  // Initialize the Ready State
        step10, // Create the Opened Promise
        step11, // Create the Closed Promise
        step12, // Create the Readable Stream
        step13, // Create the Writable Stream
        step14; // Return the created Socket
        
        
    // HELPER

    /**
     * @method defineReadOnlyProperty
     * @param {string} name the name of the readonly property
     * @param {mixed} value the readonly value
     */
    function defineReadOnlyProperty(name, value) {
        Object.defineProperty(mySocket, name, {
            value: value,
            readonly: true,
            ennumerable: true
        });
    }

    // CONSTRUCTOR STEPS

    // step 1
    
    // Create a new UDPSocket object ("mySocket").

    mySocket = this;
    step1 = vendor.createUdpSocket(options);

    // step 2

    // If the webapp does not have permission to create a UDPSocket object according to the options argument
    // then throw DOMException "SecurityError" and abort the remaining steps.
  
    step1.catch(function () {
        throw SecurityError(
            'Webapp does not have permission to create UDPSocket with these options:' + 
            JSON.stringify(options)
        );
    });
    step2 = step1;

    // step 3

    /**
     * The default remote host name or IPv4/6 address that is used for subsequent send() calls.
     * Null if not stated by the options argument of the constructor.
     *
     * @property remoteAddress
     * @readonly
     * @type {string|null}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-TCPSocket-remoteAddress
     */

    step3 = step1.then(function () {
        options.remoteAddress = String(options.remoteAddress);
        // If the options argument's remoteAddress member is present
        if (options.remoteAddress) {
            // and it is a valid host name or IPv4/6 address
            if (isValidAddress(options.remoteAddress)) {
                // then set the mySocket.remoteAddress attribute (default remote address) to the requested address.
                defineReadOnlyProperty('remoteAddress', options.remoteAddress);
            } else {
                // Else, if the remoteAddress member is present but it is not a valid host name or IPv4/6 address
                // then throw DOMException InvalidAccessError and abort the remaining steps.
                throw InvalidAccessError('Invalid Remote Address:' + options.remoteAddress);
            }
        } else {
            // Otherwise, if the options argument's remoteAddress member is absent
            // then set the mySocket.remoteAddress attribute (default remote address) to null.
            defineReadOnlyProperty('remoteAddress', null);
        }
    });

    // step 4

    /**
     * The default remote port that is used for subsequent send() calls.
     * Null if not stated by the options argument of the constructor
     *
     * @property remotePort
     * @readonly
     * @type {number|null}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-remotePort
     */

    step4 = step3.then(function () {
        options.remotePort = Number(options.remotePort);
        // If the options argument's remotePort member is present
        if (options.remotePort) {
            // and it is a valid port number
            if (isValidPortNumber(options.remotePort)) {
                // then set the mySocket.remotePort attribute (default remote port) to the requested port.
                defineReadOnlyProperty('remotePort', options.remotePort);
            } else {
                // Else, if the remotePort member is present but it is not a valid port number
                // then throw DOMException InvalidAccessError and abort the remaining steps.
                throw InvalidAccessError('Invalid Remote Port:' + options.remotePort);
            }
        } else {
            // Otherwise, if the options argument's remotePort member is absent
            // then set the mySocket.remotePort attribute (default port number) to null.
            defineReadOnlyProperty('remotePort', null);
        }
    });

    // step 5

    /**
     * The IPv4/6 address of the local interface, e.g. wifi or 3G, that the UDPSocket object is bound to.
     *
     * Can be set by the constructor's options argument's localAddress member.
     *
     * If this member is not present but the remoteAddress member is present,
     * the user agent binds the socket to a local IPv4/6 address based on the routing table
     * and possibly a preselect default local interface to use for the selected remoteAddress.
     *
     * Else, i.e. neither the localAddress or the remoteAddress members are present in the constructor's
     * options argument, the localAddress attribute is set to null.
     *
     * @property localAddress
     * @readonly
     * @type {string|null}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-TCPSocket-localAddress
     */
     
    step5 = step4.then(function () {
        // If the options argument's localAddress member is present
        // and the options argument's remoteAddress member is present
        if (options.localAddress) {
            if (options.remoteAddress) {
                // execute the following step:

                // If the options argument's localAddress member is a valid IPv4/6 address for a local interface
                // that can be used to connect to the selected remoteAddress (according to the routing table)
                if (vendor.isValidAddressCombination(options.localAddress, options.remoteAddress)) {
                    // bind the socket to this local IPv4/6 address and set the mySocket.localAddress attribute to this address.
                    return vendorDatagramSocket.bind(options.localAddress).then(function () {
                        defineReadOnlyProperty('localAddress', options.localAddress);
                    });
                } else {
                    // Else, if the localAddress member is present but it is not a valid local IPv4/6 address for a
                    // local interface that can be used to connect to the selected remoteAddress
                    // throw DOMException InvalidAccessError and abort the remaining steps.
                    throw InvalidAccessError('Invalid Local Address:' + options.localAddress);
                }
            } else {
                // Else, if the options argument's localAddress member is present
                // and the options argument's remoteAddress member is absent,
                // execute the following step:
                // If the options argument's localAddress member is a valid IPv4/6 address for a local interface
                // on the device
                if (vendor.isValidLocalAddress(options.localAddress)) {
                    // bind the socket to this local IPv4/6 address
                    return vendorDatagramSocket.bind(options.localAddress).then(function () {
                        // and set the mySocket.localAddress attribute to this addres.
                        defineReadOnlyProperty('localAddress', options.localAddress);
                    });
                } else {
                    // Else, if the localAddress member is present but it is not a valid local IPv4/6 address
                    // for a local interface on the device,
                    // throw DOMException InvalidAccessError and abort the remaining steps.
                    throw InvalidAccessError('Invalid Local Address:' + options.localAddress);
                    // Note that binding the UDPSocket to a certain local interface means that the socket
                    // can only be used to send UDP datagrams to peers reachable through this local interface.
                }
            }
        } else {
            // Else, if the options argument's localAddress member is absent,
            // and the options argument's remoteAddress member is present,
            if (options.remoteAddress) {
                // execute the following steps:
                // Use the routing table to determine the local interface(s) that can be used to send datagrams
                // to the selected remoteAddress.
                return vendorDatagramSocket.getLocaleInterface(
                    // If the routing table states that more than one local interface can be used to send datagrams
                    // to the selected remoteAddress bind the socket to the IPv4/6 address of the "default" local 
                    // interface to use for the selected remoteAddress.
                    // The selection of a "default" local interface is out of scope for this specification.
                    options.remoteAddress
                ).then(function (localAddress) {
                    // Set the mySocket.localAddress attribute to the local address that the socket is bound to.
                    defineReadOnlyProperty('localAddress', localAddress);
                }).catch(function () {
                    // If no local interface can be used to send datagrams to the selected remoteAddress,
                    // throw DOMException InvalidAccessError and abort the remaining steps.
                    throw InvalidAccessError('Invalid Local Address:' + options.remoteAddress);
                });
            } else {
                // Else, i.e. the options argument's localAddress member is absent,
                // and the options argument's remoteAddress member is absent,
                // execute the following step:
                // Set the mySocket.localAddress attribute to null.
                defineReadOnlyProperty('localAddress', null);
            }
        }
    });

    // step 6

    /**
     * The local port that the UDPSocket object is bound to. Can be set by the options argument in the constructor.
     * If not set the user agent binds the socket to an ephemeral local port decided by the system and this attribute
     * is null.
     *
     * @property localPort
     * @readonly
     * @type {number|null}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-localPort
     */

    step6 = step5.then(function () {
        // If the options argument's localPort member is absent
        if (!options.localPort) {
            // then bind the socket to an ephemeral local port decided by the system
            return vendorDatagramSocket.bindEphemeralPort().then(function (ephemeralPort) {
                // and set the mySocket.localPort attribute to null.
                defineReadOnlyProperty('localPort', null);
            });
        } else {
            // Otherwise,
            // bind the socket to the requested local port
            return vendorDatagramSocket.bind(
                options.localPort
            ).then(function () {
                // and set the mySocket.localPort attribute to the local port that the socket is bound to.
                defineReadOnlyProperty('localPort', options.localPort);
            });
        }
    });

    // step 7

    /**
     * true allows the socket to be bound to a local address/port pair that already is in use.
     * Can be set by the options argument in the constructor.
     * Default is true.
     *
     * @property addressReuse
     * @readonly
     * @type {boolean}
     * @default true
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-addressReuse
     */
  
    step7 = step6.then(function () {
        // Set the mySocket.addressReuse attribute
        // to the value of the options argument's addressReuse member if it is present
        if (options.hasOwnProperty('addressReuse')) {
            defineReadOnlyProperty('addressReuse', options.addressReuse);
        } else {
            // or to true if the options argument's addressReuse member is not present.
            defineReadOnlyProperty('addressReuse', true);
        }
    });

    // step 8

    /**
     * Only applicable for multicast. 
     * true means that sent multicast data is looped back to the sender.
     * Can be set by the options argument in the constructor.
     * Default is false.
     *
     * @property loopback
     * @readonly
     * @type {boolean}
     * @default false
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-loopback
     */

    step8 = step7.then(function () {
        // If the options argument's loopback member is present
        if (options.hasOwnProperty('loopback')) {
            // then set the mySocket.loopback attribute to the value of this field.
            defineReadOnlyProperty('loopback', options.loopback);
        } else {
            // Else set this attribute to false.
            defineReadOnlyProperty('loopback', false);
        }
    });

    // step 9

    /**
     * The state of the UDP Socket object.
     * A UDP Socket object can be in "open" "opening" or "closed" states.
     * See enum SocketReadyState for details.
     *
     * @property readyState
     * @readonly
     * @type {String}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-readyState
     */

    step9 = step8.then(function () {
        Object.defineProperty(this, 'readyState', {
            get: function() {
                return readyState;
            }
        });
        // Set the mySocket.readyState attribute to "opening".
        readyState = SocketReadyState.OPENING;
    });

    // step 10

    /**
     * Detects the result of the UDP socket creation attempt.
     * Returns the openedPromise that was created in the UDPSocket constructor.
     *
     * @property opened
     * @readonly
     * @type {Promise}
     */

    step10 = step9.then(function () {
        // Create a new promise, "openedPromise",
        // and store it so it can later be returned by the opened property.
        defineReadOnlyProperty('opened', new Promise(function (resolve, reject) {
            openedResolver = function () {
                readyState = SocketReadyState.OPEN;
                resolve();
            };
            openedRejecter = function () {
                readyState = SocketReadyState.CLOSED;
                reject();
            };
        }));
    });

    //  step 11
    
    /**
     * Detects when the UDP socket has been closed,
     * either cleanly by the webapp calling close()
     * or through an error situation, e.g. network contact lost.
     * Returns the closedPromise that was created in the UDPSocket constructor.
     *
     * @property closed
     * @readonly
     * @type {Promise}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-closed
     */

    step11 = step10.then(function () {
        // Create a new promise, "closedPromise",
        // and store it so it can later be returned by the closed property and the close method.
        defineReadOnlyProperty('closed', new Promise(function (resolve, reject) {
            
            closedResolver = function () {
                // close the readable stream
                return this.readableStream.cancel().then(function () {
                    // close the writable stream
                    return this.writableStream.cancel();
                }).then(function () {
                    // update the Ready State
                    readyState = SocketReadyState.CLOSED;
                    resolve();
                }).catch(closedRejecter);
            };
            
            closedRejecter = function () {
                readyState = SocketReadyState.CLOSED;
                reject();
            };

            // listen the vendor close event and propagate it
            vendorDatagramSocket.closed.then(closedResolver);
            
        }));
    });

    // step 12

    /**
     * The object that represents the UDP socket's source of data, from which you can read. [STREAMS]
     *
     * @property readable
     * @readonly
     * @type {ReadableStream}
     */
    var setupPromise;
    step12 = step11.then(function () {

        // Let the mySocket.readable attribute be a new ReadableStream object, [STREAMS]. 
        // The user agent must implement the adaptation layer to [STREAMS] for this new ReadableStream object 
        // through implementation of a number of functions that are given as input arguments to the constructor 
        // and called by the [STREAMS] implementation. 

        var readableStreamSourceRejecter;
        var readableStreamSource = {
            // The semantics for these functions are described below:
    
            // The constructor's start() function is called immediately by the [STREAMS] implementation. 
            start: function(controller) {
                // The start() function must run the following steps:
                
                // 1. Setup the UDP socket to the bound local and remote address/port pairs in the background 
                //    (without blocking scripts) and return openedPromise.
                setupPromise = new Promise(function (resolve, reject) {
                    readableStreamSourceRejecter = reject;
                    return vendorDatagramSocket.setup(
                        mySocket.localAddress,
                        mySocket.localPort,
                        mySocket.remoteAddress,
                        mySocket.remotePort
                    );
                });
                
                // 2. When the UDP socket has been successfully setup the following steps must run:
                setupPromise.then(function onUdpSocketSetup() {
                    //    1. Change the mySocket.readyState attribute's value to "open".
                    readyState = SocketReadyState.OPEN;
                    //    2. Resolve openedPromise with undefined.
                    openedResolver();

                    // The following internal methods of the ReadableStream are arguments of the constructor's 
                    // start() function and must be called by the start() function implementation according to 
                    // the following steps:

                    // * The enqueue() argument of start() is a function that pushes received data into the 
                    // internal buffer.
                    //   When a new UDP datagram has been received the following steps must run:
                    vendorDatagramSocket.listenDatagrams(function onDatagram(datagram, source) {
                        //   1. Create a new instance of UDPMessage.
                        var udpMessage = new UDPMessage(
                            //   2. Set the UDPMessage object's data member to a new read-only ArrayBuffer object
                            //      whose contents are the received UDP datagram [TYPED-ARRAYS].
                            toArrayBuffer(datagram),
                            //   3. Set the remoteAddress member of the UDPMessage object to the source address 
                            //      of  the received UDP datagram.
                            source.address,
                            //   4. Set the remotePort member of the UDPMessage object to the source port of 
                            //      the received UDP datagram.
                            source.port
                        );
                        
                        //   5. Call enqueue() to push the UDPMessage object into the internal [STREAMS] 
                        //      receive buffer. 

                        //      Note that enqueue() returns false if the high watermark of the buffer is reached. 
                        //      However, as there is no flow control mechanism in UDP the flow of datagrams can't 
                        //      be stopped. 
                        //      The enqueue() return value should therefore be ignored. 
                        //      This means that datagrams will be lost if the internal receive buffer has been 
                        //      filled to it's memory limit but this is the nature of an unreliable protocol as UDP.
                        
                        /*var returnValue =*/ controller.enqueue(udpMessage);
                    });
                });

                // * The error() argument of start() is a function that handles readable stream errors 
                //   and closes the readble stream.

                //   Upon detection that the attempt to setup a new UDP socket 
                //   (mySocket.readyState is "opening") has failed, 
                //   e.g. because the local address/port pair is already in use and 
                //   mySocket.addressReuse is false, the following steps must run:
                setupPromise.catch(function onSetupError(error) {
                    //   1. Call error() with DOMException "NetworkError".
                    var networkError = NetworkError('UDPSocket setup error: ' + error.message);
                    controller.error(networkError);
                    //   2. Reject openedPromise with DOMException "NetworkError".
                    openedRejecter(networkError);
                    //   3. Reject closedPromise with DOMException "NetworkError".
                    closedRejecter(networkError);
                    //   4. Change the mySocket.readyState attribute's value to "closed" 
                    readyState = SocketReadyState.CLOSED;
                    //      and release any underlying resources associated with this socket.
                    releaseResources();
                });
                
                //   Upon detection that there is an error with the established UDP socket
                //   (mySocket.readyState is "open"),  e.g. network connection is lost, the following steps must run:
                vendorDatagramSocket.listenError(function onVendorError(error) {
                    //   1. Call error() with DOMException "NetworkError".
                    var networkError = NetworkError(error.message);
                    controller.error(networkError);
                    //   2. Reject closedPromise with DOMException "NetworkError".
                    closedRejecter(networkError);
                    //   3. Change the mySocket.readyState attribute's value to "closed"
                    readyState = SocketReadyState.CLOSED;
                    //      and release any underlying resources associated with this socket.
                    releaseResources();
                });

                //   When a new UDP datagram has been received 
                function toArrayBuffer(data) {
                    var buffer;
                    try {
                        //   and upon detection that it is not possible to convert the received UDP data 
                        //   to ArrayBuffer, [TYPED-ARRAYS], 
                        buffer = new ArrayBuffer(data);
                    } catch(error) {
                        //   the following steps must run:
                        //   1. Call error() with TypeError.
                        var typeError = TypeError(error.message);
                        controller.error(typeError);
                        //   2. Reject closedPromise with TypeError.
                        closedRejecter(typeError);
                        //   3. Change the mySocket.readyState attribute's value to "closed" 
                        readyState = SocketReadyState.CLOSED;
                        //      and release any underlying resources associated with this socket.
                        releaseResources();
                    }
                }

                function releaseResources() {
                    // TODO 
                    // Check any resources that could be released
                }

                return mySocket.opened;
            },

            // The constructor's pull() function must be omitted as there is no flow control mechanism in UDP and the flow of datagrams 
            // cannot be stopped and started again.

            pull: undefined,

            // The constructor's cancel() function input argument is called by the [STREAMS] implementation when the ReadbleStream 
            // should be canceled. 
            // For UDP this means that the UDP socket should be closed for reading and writing. 
            cancel: function (reason) {
                // The cancel() function must run the following steps:
                // 1. If mySocket.readyState is "closed" then
                if (readyState === SocketReadyState.CLOSED) {
                    // do nothing and abort the remaning steps.
                    return;
                }
                // 2. If mySocket.readyState is "opening" then 
                if (readyState === SocketReadyState.OPENING) {
                    // fail the UDP socket setup process, 
                    readableStreamSourceRejecter();
                    // reject openedPromise with DOMException AbortError 
                    openedRejecter(
                        AbortError()
                    );
                    // and set the mySocket.readyState attribute to "closed".
                    readyState = SocketReadyState.CLOSED;
                    return;
                }
                // 3. If mySocket.readyState is "open" the the following steps must run:
                if (readyState === SocketReadyState.OPEN) {
                    // 1. Call mySocket.writeable.close() to assure that any buffered send data is sent.
                    mySocket.writable.close();
                    // 2. Set the mySocket.readyState attribute's value to "closed".
                    readyState = SocketReadyState.CLOSED;
                    // 3. Resolve closedPromise with undefined 
                    closedResolver();
                    //    and release any underlying resources associated with this socket.
                }
            }
        };

        defineReadOnlyProperty(
            'readable',
            new ReadableStream(
                readableStreamSource
                /*
                ISSUE 1

                If the constructor's strategy argument is omitted the default backpressure behavior of readable 
                streams applies. 

                Currently this means that the ReadableStream object begins applying backpressure after 1 chunk 
                has been enqueued to the internal ReadableStream object's input buffer. 

                To be further investigated which readable stream strategy that should be applied to UDP.
                */
            )
        );

    });

    // step 13
    
    /**
     * The object that represents the UDP socket's destination for data, into which you can write. [STREAMS]
     *
     * @property writable
     * @readonly
     * @type {WritableStream}
     * @see https://www.w3.org/TR/tcp-udp-sockets/#widl-UDPSocket-writeable
     */

    step13 = step12.then(function () {
        // Let the mySocket.writeable attribute be a new WritableStream object, [STREAMS]. 

        // The user agent must implement the adaptation layer to [STREAMS] for this new WritableStream 
        // object through implementation of a number of functions that are given as input arguments to 
        // the constructor and called by the [STREAMS] implementation. 
        var writableStreamSource = {
            // The semantics for these functions are described below:

            // The constructor's start() function must run the following steps:
            start: function (controller) {
                // Create a new promise, "writableStartPromise".
                var writableStartPromise = new Promise(function (resolve, reject) {
                    // If the attempt to create a new UDP socket 
                    // (see the description of the semantics for the mySocket.readable attribute constructor's 
                    // start() function ) succeded 
                    setupPromise.then(function () {
                        // resolve writableStartPromise with undefined, 
                        resolve(undefined);
                    });
                    // else
                    setupPromise.catch(function (error) {
                        // reject writableStartPromise with DOMException "NetworkError".
                        reject(NetworkError('Setup UDP Socket failed: ' + error.message));
                    });
                });
                return writableStartPromise;
            },

            // The constructor's write(chunk) function is called by the [STREAMS] implementation 
            // to write UDP data. 
            // The write() function must run the following steps:
            write:  function(chunk) {
                // Create a new promise, "writePromise"
                var writePromise = new Promise(function (resolve, reject) {
                    // Convert the chunk argument to a UDPMessage object (per [WEBIDL] dictionary conversion).
                    var udpMessage = new UDPMessage(chunk);
                    // If no default remote address was specified in the UDPSocket's constructor options argument's 
                    // remoteAddress member and the UDPMessage object's remoteAddress member is not present or null
                    if (!options.remoteAddress && !udpMessage.remoteAddress) {
                        // then throw DOMException InvalidAccessError and abort these steps.
                        throw InvalidAccessError('No Remote Address');
                    } 
                    // If no default remote port was specified in the UDPSocket's constructor options argument's 
                    // remotePort member and the UDPMessage object's remotePort member is not present or null 
                    if (!options.remotePort && !udpMessage.remotePort) {
                        // then throw DOMException InvalidAccessError and abort these steps.
                        throw InvalidAccessError('No Remote Port');
                    }
                    // If the UDPMesssage object's remoteAddress and/or remotePort member(s) are present 
                    if (udpMessage.remoteAddress && udpMessage.remotePort) {
                        // but the webapp does not have permission to send UDP packets to this address and port 
                        vendor.hasPermissionToSend(options).then(function (permissionOk) {
                            if (!permissionOk) { //  TODO:  check Webapp Permission
                                // then throw DOMException SecurityError and abort these steps.
                                throw SecurityError('No Remote Port');
                            }
                        });
                    }

                    // TODO: Clarify below UDP message remote Address & Port 

                    // Send UDP data with data passed in the data member of the UDPMessage object. 

                    // The destination address is the address defined by the UDPMesssage object's remoteAddress 
                    // member if present, 
                    // else the destination address is defined by the UDPSocket's constructor options argument's 
                    // remoteAddress member. 
                    if (!udpMessage.remoteAddress) {
                        udpMessage.remoteAddress = options.remoteAddress;
                    }

                    // The destination port is the port defined by the UDPMesssage object's remotePort member 
                    // if present, 
                    // else the destination port is defined by the UDPSocket's constructor options argument's 
                    // remotePort member.
                    if (!udpMessage.remotePort) {
                        udpMessage.remotePort = options.remotePort;
                    }

                    var sendUdpDataPromise = vendorDatagramSocket.sendUdpData(udpMessage);
                    // If sending succeed 
                    sendUdpDataPromise.then(function () {
                        // resolve writePromise with undefined, 
                        resolve(undefined);
                    });
                    // else 
                    sendUdpDataPromise.catch(function (error) {
                        // reject writePromise with DOMException "NetworkError". 
                        resolve(NetworkError('Send UDP Data failed: ' + error.message));
                    });
                });

                return writePromise;
            }
            // The constructor's close() and abort() functions must be omitted as it is not possible 
            // to just close the writable side of a UDP socket.
        };

        defineReadOnlyProperty('writable', new WritableStream(
            writableStreamSource
            /*
            ISSUE 2

            If the constructor's strategy argument is omitted the Default strategy for Writable Streams applies. 

            Currently this means that the WriteableStream object goes to "waiting" state after 1 chunk has been 
            written to the internal WriteableStream object's output buffer. 

            This means that the webapp should use .ready to be notified of when the state changes to "writable", 
            i.e. the queued chunk has been written to the remote peer and more data chunks could be written. 

            To be further investigated which WritableStreamStrategy that should be applied to UDP.
             */
        ));
    });

    // step 14
    step14 = step13.then(function () {
        // TODO: Return the newly created UDPSocket object ("mySocket") to the webapp.
        return mySocket;
    });

}


/**
 * Closes the UDP socket.
 * Returns the closedPromise that was created in the UDPSocket constructor.
 */
UDPSocket.prototype.close = function () {
    // step 1
    // Call mysocket.readable.cancel(reason). (Reason codes TBD.)
    this.readable.cancel('reason').then(function () {
        // TODO: Get access to vendorDatagramSocket 
        vendorDatagramSocket.close();
    });
    // step 2
    // Return closedPromise.
    return this.closed;
};

/**
 * Joins a multicast group identified by the given address.
 * Note that even if the socket is only sending to a multicast address,
 * it is a good practice to explicitely join the multicast group (otherwise some routers may not relay packets).
 *
 * @method joinMulticast
 * @param {string} multicastGroupAddress The multicast group address.
 */
UDPSocket.prototype.joinMulticast = function (multicastGroupAddress) {
    // TODO: Get access to vendorDatagramSocket 
    vendorDatagramSocket.joinMulticast(
        multicastGroupAddress
    );
};

/**
 * Leaves a multicast group membership identified by the given address.
 *
 * @method leaveMulticast
 * @param {string} multicastGroupAddress The multicast group address.
 */
UDPSocket.prototype.leaveMulticast = function (multicastGroupAddress) {
    // TODO: Get access to vendorDatagramSocket 
    vendorDatagramSocket.leaveMulticast(
        multicastGroupAddress
    );
};



// PUBLIC API

exports.UDPPermission = UDPPermission;
exports.UDPSocket = UDPSocket;

