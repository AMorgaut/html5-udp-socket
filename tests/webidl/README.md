# Webidl: idlharness

Test Webidl compliance with [testharness idlharness](http://testthewebforward.org/docs/testharness-idlharness.html)

Runs well on my web-platform-test udp-socket fork

Will try to add to travis via the [Web Platform Test Runner for Node.js](https://github.com/domenic/wpt-runner) done by [Domenic Denicola](https://github.com/domenic)

## Summary

Harness status: OK

Found 30 tests

28 Pass
2 Fail

## Details

| Result	| Test Name	| Message |
|---------|-----------|---------|
| Pass	| Navigator interface: attribute udpPermission	|
| Pass	| Navigator must be primary interface of navigator|	
| Pass	| Stringification of navigator	|
| Pass	| Navigator interface: navigator must inherit property "udpPermission" with the proper type (0)	|
| Pass	| UDPPermission interface: existence and properties of interface object	|
| Pass	| UDPPermission interface object length	|
| Pass	| UDPPermission interface object name	|
| Fail	| UDPPermission interface: existence and properties of interface prototype object	| assert_equals: prototype of UDPPermission.prototype is not Object.prototype expected object "[object Object]" but got object "[object Object]" at IdlInterface.<anonymous> (http://web-platform.test:8000/resources/idlharness.js:993:17)    at Test.step (http://web-platform.test:8000/resources/testharness.js:1406:25)    at test (http://web-platform.test:8000/resources/testharness.js:501:18)    at IdlInterface.test_self (http://web-platform.test:8000/resources/idlharness.js:914:5)    at IdlInterface.test (http://web-platform.test:8000/resources/idlharness.js:739:14)    at self.IdlArray.IdlArray.test (http://web-platform.test:8000/resources/idlharness.js:398:28) |
| Pass	| UDPPermission interface: existence and properties of interface prototype object's "constructor" property	|
| Pass	| UDPPermission interface: operation hasPermission(UDPPermissionOptions)	|
| Pass	| UDPPermission interface: operation requestPermission(UDPPermissionOptions) |	
| Pass	| UDPSocket interface: existence and properties of interface object	|
| Pass	| UDPSocket interface object length	|
| Pass	| UDPSocket interface object name	|
| Fail	| UDPSocket interface: existence and properties of interface prototype object	| assert_equals: prototype of UDPSocket.prototype is not Object.prototype expected object "[object Object]" but got object "[object Object]"    at IdlInterface.<anonymous> (http://web-platform.test:8000/resources/idlharness.js:993:17)    at Test.step (http://web-platform.test:8000/resources/testharness.js:1406:25)    at test (http://web-platform.test:8000/resources/testharness.js:501:18)    at IdlInterface.test_self (http://web-platform.test:8000/resources/idlharness.js:914:5)    at IdlInterface.test (http://web-platform.test:8000/resources/idlharness.js:739:14)    at self.IdlArray.IdlArray.test (http://web-platform.test:8000/resources/idlharness.js:398:28) | 
| Pass	| UDPSocket interface: existence and properties of interface prototype object's "constructor" property	| 
| Pass	| UDPSocket interface: attribute localAddress	| 
| Pass	| UDPSocket interface: attribute localPort	| 
| Pass	| UDPSocket interface: attribute remoteAddress	| 
| Pass	| UDPSocket interface: attribute remotePort	| 
| Pass	| UDPSocket interface: attribute addressReuse	| 
| Pass	| UDPSocket interface: attribute loopback	| 
| Pass	| UDPSocket interface: attribute readyState	| 
| Pass	| UDPSocket interface: attribute opened	| 
| Pass	| UDPSocket interface: attribute closed	| 
| Pass	| UDPSocket interface: attribute readable	| 
| Pass	| UDPSocket interface: attribute writable	| 
| Pass	| UDPSocket interface: operation close()	| 
| Pass	| UDPSocket interface: operation joinMulticast(DOMString)	| 
| Pass	| UDPSocket interface: operation leaveMulticast(DOMString) | 
