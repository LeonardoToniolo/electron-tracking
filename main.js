'use strict'

const path = require('path')
const { app, ipcMain, Tray } = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')

require('electron-reload')(__dirname)

const TrackingData = new DataStore({ name: 'Shipment Main' })

function main() {
    new Tray(path.join("app","./img/sunTemplate.png" ));

    let win = new Window({
        file: path.join('app', 'index.html')
    })

    let addShipmentWin
    let detailShipmentWin

    win.once('show', () => {
        win.webContents.send('shipments', TrackingData.shipment)
    })

    ipcMain.on('add-shipment-window', () => {
        if (!addShipmentWin) {
            addShipmentWin = new Window({
                file: path.join('app', 'add.html'),
                width: 400,
                height: 400,
                parent: win
            })

            // cleanup
            addShipmentWin.on('closed', () => {
                addShipmentWin = null
            })
        }
    })

    ipcMain.on('detail-shipment-window', (event, trackingEle) => {
        if (!detailShipmentWin) {
            detailShipmentWin = new Window({
                file: path.join('app', 'detail.html'),
                width: 400,
                height: 400,
                show: false,
                parent: win
            })

            detailShipmentWin.once('show', () => {
                detailShipmentWin.webContents.send('shipment-elem-data', trackingEle)
            })

            // cleanup
            detailShipmentWin.on('closed', () => {
                detailShipmentWin = null
            })
        }
    })

    ipcMain.on('add-shipment', (event, trackingEle) => {
        win.send('shipments', TrackingData.addShipment(trackingEle).shipment)
    })

    ipcMain.on('delete-shipment', (event, trackingEle) => {
        win.send('shipments', TrackingData.deleteShipmentByID(trackingEle).shipment)
    })
}

app.on('ready', main)

app.on('window-all-closed', function() {
    app.quit()
})
