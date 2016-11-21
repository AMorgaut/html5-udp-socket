var 
    // test module
    chai = require('chai'),
    // tested enums API
    api = require("../index.js"),
    // test API
    expect = chai.expect;


describe("html5 udp enums", function() {

    describe("TCPUDPPermissionState", function() {
        it("should exist", function() {
            expect(api.TCPUDPPermissionState).to.be.an.object
        })
        it("should have a GRANTED value", function() {
            expect(api.TCPUDPPermissionState).to.have.property('GRANTED')
        })
        it("should have a DENIED value", function() {
            expect(api.TCPUDPPermissionState).to.have.property('DENIED')
        })
        it("should have a PROMPT value", function() {
            expect(api.TCPUDPPermissionState).to.have.property('PROMPT')
        })
        it("should have no equal values", function() {
            expect(api.TCPUDPPermissionState.GRANTED).to.not.equal(api.TCPUDPPermissionState.DENIED)
            expect(api.TCPUDPPermissionState.GRANTED).to.not.equal(api.TCPUDPPermissionState.PROMPT)
            expect(api.TCPUDPPermissionState.DENIED).to.not.equal(api.TCPUDPPermissionState.PROMPT)
        })
    })

    describe("SocketReadyState", function() {
        it("should exist", function() {
            expect(api.SocketReadyState).to.be.an.object
        })
        it("should have a OPENING value", function() {
            expect(api.SocketReadyState).to.have.property('OPENING')
        })
        it("should have a OPEN value", function() {
            expect(api.SocketReadyState).to.have.property('OPEN')
        })
        it("should have a CLOSED value", function() {
            expect(api.SocketReadyState).to.have.property('CLOSED')
        })
        it("should have no equal values", function() {
            expect(api.SocketReadyState.OPENING).to.not.equal(api.SocketReadyState.OPEN)
            expect(api.SocketReadyState.OPENING).to.not.equal(api.SocketReadyState.CLOSED)
            expect(api.SocketReadyState.OPEN).to.not.equal(api.SocketReadyState.CLOSED)
        })
    })
});
