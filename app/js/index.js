'use strict'

const { ipcRenderer } = require('electron')

const deleteShipment = (e) => {
    ipcRenderer.send('delete-shipment', e.target.id)
}

ipcRenderer.on('shipments', (event, shipments) => {
    const shipmentList = document.getElementById('shipmentList')

    const shipmentItems = shipments.reduce((html, shipment) => {
        html += `<li class="shipment-item" id="${shipment.id}">${shipment.shipmentTitle}</li>`
        return html
    }, '')

    const openShipmentDatail = (e) => {
        var shipment1 = shipments.filter(t => {
            return t.id == e.target.id;
        })
        ipcRenderer.send('detail-shipment-window', shipment1)
    }
    shipmentList.innerHTML = shipmentItems
    shipmentList.querySelectorAll('.shipment-item').forEach(item => {
        item.addEventListener('click', openShipmentDatail)
    })
})

document.getElementById('createShipmentBtn').addEventListener('click', () => {
    ipcRenderer.send('add-shipment-window')
})
