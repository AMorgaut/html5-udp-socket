

/**
 * Check if the app is authorized to create a UDPSocket object that sends UDP packets to the requested remote address and port
 *
 * @param {string} remoteAddress
 * @param {number} remotePort
 */
exports.checkCreateRemotePermission = function (remoteAddress, remotePort) {
    throw new Error('checkCreateRemotePermission() Not implemented');
};


/**
 * Check if the app is authorized to create a UDPSocket object that sends UDP packets from the requested local address and port
 *
 * @param {string} localAddress
 * @param {number} localPort
 */
exports.checkCreateLocalPermission = function (localAddress, localPort) {
    throw new Error('checkCreateLocalPermission() Not implemented');
};


/**
 * @param {PermissionOptions} permissionOptions
 */
exports.checkCreatePermissionFromSettings = function (permissionOptions) {
    throw new Error('checkCreatePermissionFromSettings() Not implemented');
};


/**
 *  true if the localAddress member is a valid IPv4/6 address for a local interface that can be used to connect 
 *  to the selected remoteAddress (according to the routing table)
 *
 * @param {string} localAddress
 * @param {string} remoteAddress 
 */
exports.isValidAddressCombination = function (localAddress, remoteAddress) {
    throw new Error('isValidAddressCombination() Not implemented');
};


/**
 * @param {string} localAddress
 */
exports.isValidLocalAddress = function (permissionOptions) {
    throw new Error('isValidLocalAddress() Not implemented');
};


/**
 * @param {options} options
 */
exports.createUdpSocket = function (options) {
    return new DatagramSocket(options);
};

/**
 * @class DatagramSocket
 * @param {Object} options
 */
function DatagramSocket(options) {
    console.warn('createUdpSocket() Not implemented');
}

/**
 * @param {string|number} localAddressOrPort
 */
DatagramSocket.prototype.bind = function (localAddressOrPort) {
    throw new Error('bind() Not implemented');
};


/**
 * @param {string} localAddress
 */
DatagramSocket.prototype.getLocaleInterface = function (localAddress) {
    throw new Error('getLocaleInterface() Not implemented');
};


/**
 * bind the socket to an ephemeral local port decided by the system
 */
DatagramSocket.prototype.bindEphemeralPort = function () {
    throw new Error('bindEphemeralPort() Not implemented');
};


/**
 * 
 */
DatagramSocket.prototype.setup = function (options) {
    throw new Error('setup() Not implemented');
};


/**
 */
DatagramSocket.prototype.closed = function () {
    throw new Error('closed() Not implemented');
};

/**
 */
DatagramSocket.prototype.close = function () {
    throw new Error('close() Not implemented');
};

/**
 * @param {string} multicastGroupAddress
 */
DatagramSocket.prototype.joinMulticast = function (multicastGroupAddress) {
    throw new Error('joinMulticast() Not implemented');
};

/**
 * @param {string} multicastGroupAddress
 */
DatagramSocket.prototype.leaveMulticast = function (multicastGroupAddress) {
    throw new Error('leaveMulticast() Not implemented');
};

