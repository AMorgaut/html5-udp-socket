var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var vendorTemplate = require("../_vendor_template.js");

describe("html5 udp vendor template", function() {

    describe("checkCreateRemotePermission", function() {
        it("should exist", function() {
            expect(vendorTemplate.checkCreateRemotePermission).to.be.a.function
        })
        it("should expect 2 parameters", function() {
            expect(vendorTemplate.checkCreateRemotePermission).to.have.property('length', 2)
        })
        it("should throw", function() {
            expect(vendorTemplate.checkCreateRemotePermission).to.throw(Error)
        })
    })

    describe("checkCreateLocalPermission", function() {
        it("should exist", function() {
            expect(vendorTemplate.checkCreateLocalPermission).to.be.a.function
        })
        it("should expect 2 parameters", function() {
            expect(vendorTemplate.checkCreateLocalPermission).to.have.property('length', 2)
        });
        it("should throw", function() {
            expect(vendorTemplate.checkCreateLocalPermission).to.throw(Error)
        })
    })

    describe("checkCreatePermissionFromSettings", function() {
        it("should exist", function() {
            expect(vendorTemplate.checkCreatePermissionFromSettings).to.be.a.function
        })
        it("should expect 1 parameter", function() {
            expect(vendorTemplate.checkCreatePermissionFromSettings).to.have.property('length', 1)
        });
        it("should throw", function() {
            expect(vendorTemplate.checkCreatePermissionFromSettings).to.throw(Error)
        })
    })

    describe("createUdpSocket", function() {
        var socket;

        it("should exist", function() {
            expect(vendorTemplate.createUdpSocket).to.be.a.function
        })
        it("should expect 1 parameter", function() {
            expect(vendorTemplate.createUdpSocket).to.have.property('length', 1)
        });
        it("should return a valid datagram socket API", function() {
            expect(vendorTemplate.createUdpSocket).to.not.throw(Error)
        })
    })

    describe("isValidLocalAddress", function() {
        it("should exist", function() {
            expect(vendorTemplate.isValidLocalAddress).to.be.a.function
        })
        it("should expect 1 parameters", function() {
            expect(vendorTemplate.isValidLocalAddress).to.have.property('length', 1)
        });
        it("should throw", function() {
            expect(vendorTemplate.isValidLocalAddress).to.throw(Error)
        })
    })


    describe("vendorDatagramSocket.bind", function() {
        var socket = vendorTemplate.createUdpSocket()
        it("should exist", function() {
            expect(socket.bind).to.be.a.function
        })
        it("should expect 1 parameters", function() {
            expect(socket.bind).to.have.property('length', 1)
        });
        it("should throw", function() {
            expect(socket.bind).to.throw(Error)
        })
    })

    describe("vendorDatagramSocket.getLocaleInterface", function() {
        var socket = vendorTemplate.createUdpSocket()
        it("should exist", function() {
            expect(socket.getLocaleInterface).to.be.a.function
        })
        it("should expect 1 parameter", function() {
            expect(socket.getLocaleInterface).to.have.property('length', 1)
        });
        it("should throw", function() {
            expect(socket.getLocaleInterface).to.throw(Error)
        })
    })

});
