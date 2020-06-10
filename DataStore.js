'use strict'

const Store = require('electron-store')

class DataStore extends Store {
    constructor(settings) {
        super(settings)

        this.shipment = this.get('shipments') || []
    }

    saveShipments() {
        this.set('shipments', this.shipment)
        return this
    }

    getShipments() {
        this.shipment = this.get('shipments') || []

        return this
    }

    getShipmentByID(shipmentId) {
        this.shipment = this.shipment.filter(s => {
            return s.id == shipmentId;
        })

        return this
    }

    addShipment(shipment) {
        this.shipment = [...this.shipment, shipment]

        return this.saveShipments()
    }

    deleteShipmentByID(shipmentId) {
        this.shipment = this.shipment.filter(s => {
            return s.id != shipmentId;
        })

        return this.saveShipments()
    }
}

module.exports = DataStore
