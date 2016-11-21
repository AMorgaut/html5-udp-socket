var 
    // test module
    chai = require('chai'),
    // rewire module
    rewire = require('rewire'),
    // tested enums API
    api = rewire("../index.js"),
    // test API
    expect = chai.expect;


describe("html5 udp enums", function() {

    describe("TCPUDPPermissionState", function() {
        var TCPUDPPermissionState = api.__get__('TCPUDPPermissionState');
        it("should exist", function() {
            expect(TCPUDPPermissionState).to.be.an.object
        })
        it("should have a GRANTED value", function() {
            expect(TCPUDPPermissionState).to.have.property('GRANTED')
        })
        it("should have a DENIED value", function() {
            expect(TCPUDPPermissionState).to.have.property('DENIED')
        })
        it("should have a PROMPT value", function() {
            expect(TCPUDPPermissionState).to.have.property('PROMPT')
        })
        it("should have no equal values", function() {
            expect(TCPUDPPermissionState.GRANTED).to.not.equal(TCPUDPPermissionState.DENIED)
            expect(TCPUDPPermissionState.GRANTED).to.not.equal(TCPUDPPermissionState.PROMPT)
            expect(TCPUDPPermissionState.DENIED).to.not.equal(TCPUDPPermissionState.PROMPT)
        })
    })

    describe("SocketReadyState", function() {
        var SocketReadyState = api.__get__('SocketReadyState');
        it("should exist", function() {
            expect(SocketReadyState).to.be.an.object
        })
        it("should have a OPENING value", function() {
            expect(SocketReadyState).to.have.property('OPENING')
        })
        it("should have a OPEN value", function() {
            expect(SocketReadyState).to.have.property('OPEN')
        })
        it("should have a CLOSED value", function() {
            expect(SocketReadyState).to.have.property('CLOSED')
        })
        it("should have no equal values", function() {
            expect(SocketReadyState.OPENING).to.not.equal(SocketReadyState.OPEN)
            expect(SocketReadyState.OPENING).to.not.equal(SocketReadyState.CLOSED)
            expect(SocketReadyState.OPEN).to.not.equal(SocketReadyState.CLOSED)
        })
    })
});
