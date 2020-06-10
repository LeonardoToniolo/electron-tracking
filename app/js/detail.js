'use strict'

const { ipcRenderer } = require('electron')
require('dotenv').config()
const { dialog } = require('electron').remote
const TrackingMore = require('../TrackingMore.js').TrackingMore

// on receive todos
ipcRenderer.on('shipment-elem-data', (event, trackingElement) => {
    trackingElement = trackingElement[0]
    var name = document.getElementById('name');
    name.innerHTML = trackingElement.shipmentTitle

    var postData = {
        "tracking_number": trackingElement.shipmentCode
    };
    var url = 'http://api.trackingmore.com/v2/carriers/detect';
    TrackingMore.sentRes(url, postData, "POST", function(data) {
        var obj = JSON.parse(data);
        var postData = null;
        var url = `http://api.trackingmore.com/v2/trackings/${trackingElement.carrierCode}/${trackingElement.shipmentCode}/en`;
        TrackingMore.sentRes(url, postData, "GET", function(data) {
            var obj = JSON.parse(data);
            console.log(obj)
            const status = document.getElementById('status')
            const trackingList = document.getElementById('trackingList')
            const itemTimeLength = document.getElementById('itemTimeLength')
            const trackingListEle = obj.data.origin_info.trackinfo || ""

            const trackingItems = trackingListEle.reduce((html, ele) => {
                html += `<li class="shipment-item" id="">${ele.StatusDescription}, ${ele.Details} <br/> ${ele.checkpoint_status}</li>`
                return html
            }, '')

            status.innerHTML = (obj.data.status || "")
            trackingList.innerHTML = (trackingItems || "No data found")
            itemTimeLength.innerHTML = "tempo percorrido: " + (obj.data.itemTimeLength || "")
        });
    });

    // remove tracking button
    document.getElementById('removeTrackingBtn').addEventListener('click', () => {
        var postData = null;
        var url = `http://api.trackingmore.com/v2/trackings/${trackingElement.carrierCode}/${trackingElement.shipmentCode}`;
        TrackingMore.sentRes(url, postData, "DELETE", function(data) {
            var obj = JSON.parse(data);
            console.log(obj)
            if (obj.meta.code==200) {
                ipcRenderer.send('delete-shipment', trackingElement.id)
                window.close()
            } else {
                const options = {
                    type: 'question',
                    buttons: ['Yes, please', 'No, thanks'],
                    defaultId: 0,
                    title: 'Question',
                    message: 'Unexpected error! do you want force delete?',
                };

                dialog.showMessageBox(null, options, response => {
                    if (response == 0) {
                        ipcRenderer.send('delete-shipment', trackingElement.id)
                        window.close()
                    } else {
                        window.close()
                    }
                });
            }
        });


    })
})
