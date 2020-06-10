'use strict'

const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote
const TrackingMore = require('../TrackingMore.js').TrackingMore
require('dotenv').config()

document.getElementById('shipmentForm').addEventListener('submit', (evt) => {
    evt.preventDefault()

    // input on the form
    const inputName = evt.target[0]
    const input = evt.target[1]

    var postData = {
        "tracking_number": input.value
    };
    var url = 'http://api.trackingmore.com/v2/carriers/detect';
    TrackingMore.sentRes(url, postData, "POST", function(data) {
        var obj = JSON.parse(data);
        if (obj.meta.code==200) {

            var element = {
                shipmentCode: input.value,
                carrierCode: obj.data[0].code,
                carrierName: obj.data[0].name,
                shipmentTitle:inputName.value,
                id: (Math.random()*100000),
            }

            var postData = {
                "tracking_number": element.shipmentCode,
                "carrier_code": element.carrierCode,
                "title": element.shipmentTitle,
                "order_id": '#' + (Math.random()*100000),
                "lang": "en"
            };
            var url = 'http://api.trackingmore.com/v2/trackings/post';
            TrackingMore.sentRes(url, postData, "post", function(data) {
                var obj = JSON.parse(data);
                if (obj.meta.code==200) {
                    ipcRenderer.send('add-shipment',element)
                    window.close()
                } else {
                    const options = {
                        type: 'question',
                        buttons: ['Yes, please', 'No, thanks'],
                        defaultId: 0,
                        title: 'Question',
                        message: 'Unexpected error! do you want to try again?',
                    };

                    dialog.showMessageBox(null, options, response => {
                        if (response == 0) {
                            input.value = ''
                        } else {
                            window.close()
                        }
                    });
                }
            });


        } else {
            const options = {
                type: 'question',
                buttons: ['Yes, please', 'No, thanks'],
                defaultId: 0,
                title: 'Question',
                message: 'Invalid code! Do you want to type again?',
            };

            dialog.showMessageBox(null, options, response => {
                if (response == 0) {
                    input.value = ''
                } else {
                    window.close()
                }
            });
        }
    });
})
