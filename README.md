# html5-udp-socket

[DRAFT]

UDP Socket API as proposed by the ex W3C Sysapps WG

> Note: At the time this specification, the [STREAM API](https://streams.spec.whatwg.org) was not yet finalized
> This implementation will probably require some adaptations in its algorythms

Reference: [TCP UDP Socket API](https://www.w3.org/TR/tcp-udp-sockets/)

## How to use

To things to be aware of:

1. This implementation is still just a draft in progress. It needs at least to complete the `readable` and `writable` Stream properties implementations.
2. It is expected to be used as a high level layer worker on dedicated vendors
 
The objective it to write vendor adapters such as:

* Cordova plugin (Android/iOs/...)
* React Native /  NativeScript 
* Chrome App
* Firefox OS
* WinJS
* node.js / Wakanda
* CommonJS

Anyone is very Welcome to contribute to this project ;-)

## Usage Example

```javascript
//
// This example shows a simple implementation of UPnP-SSDP M-SEARCH
// discovery using a multicast UDPSocket
//

var address = '239.255.255.250',
    port = '1900',
    serviceType = 'upnp:rootdevice',
    rn = '\r\n',
    search = '';

//  Request permission to send multicast messages to the address and
//  port reserved for SSDP
navigator.udpPermission.requestPermission({remoteAddress:"239.255.255.250",
                                           remotePort:1900}).then(
  () => {
    // Permission was granted

    //  Create a new UDP client socket
    var mySocket = new UDPSocket();

    // Build an SSDP M-SEARCH multicast message
    search += 'M-SEARCH * HTTP/1.1' + rn;
    search += 'ST: ' + serviceType + rn;
    search += 'MAN: "ssdp:discover"' + rn;
    search += 'HOST: ' + address + ':' + port + rn;
    search += 'MX: 10';


    // Receive and log SSDP M-SEARCH response messages
    function receiveMSearchResponses() {
      mySocket.readable.getReader().read().then(({ value, done }) => {
        if (done) return;

        console.log('Remote address: ' + value.remoteAddress +
                    'Remote port: ' + value.remotePort +
                    'Message: ' + ab2str(value.data));
        // ArrayBuffer to string conversion could also be done by piping
        // through a transform stream. To be updated when the Streams API
        // specification has been stabilized on this point.
      });
    }

    // Join SSDP multicast group
    mySocket.joinMulticast(address);

    // Send SSDP M-SEARCH multicast message
    mySocket.writeable.write(
      {data : str2ab(search),
       remoteAddress : address,
       remotePort : port
      }).then(
        () => {
          // Data sent sucessfully, wait for response
          console.log('M-SEARCH Sent');
          receiveMSearchResponses();
        },
        e => console.error("Sending error: ", e);
    );

    // Log result of UDP socket setup.
    mySocket.opened.then(
      () => {
        console.log("UDP socket created sucessfully");
      },
      e =>console.error("UDP socket setup failed due to error: ", e);
    );

    // Handle UDP socket closed, either as a result of the application
    // calling mySocket.close() or an error causing the socket to be
    // closed.
    mySocket.closed.then(
      () => {
         console.log("Socket has been cleanly closed");
      },
      e => console.error("Socket closed due to error: ", e);
    );

  },
  e => console.error("Sending SSDP multicast messages was denied due to error: ", e);
);
```

## MIT License

Copyright (c) 2016 Alexandre Morgaut

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
