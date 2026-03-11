
function onScriptLoad(txnToken, orderId, amount) {
    alert("open Paytm Payment Mode")
    var config = {
        "root": "",
        "flow": "DEFAULT",
        "merchant": {
            "name": "Sastasundar",
            "logo": "https://business.paytm.com/demo//static/images/merchant-logo.png?v=1.4"
        },
        "style": {
            "headerBackgroundColor": "#8dd8ff",
            "headerColor": "#3f3f40"
        },
        "data": {
            "orderId": orderId,
            "token": txnToken,
            "tokenType": "TXN_TOKEN",
            "amount": amount
        },
        "handler": {
            "notifyMerchant": function (eventName, data) {
                if (eventName == 'SESSION_EXPIRED') {
                    alert("Your session has expired!!");
                    location.reload();
                }
            }
        }
    };

    if (window.Paytm && window.Paytm.CheckoutJS) {
        // initialze configuration using init method
        window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
            // console.log('Before JS Checkout invoke');
            // after successfully update configuration invoke checkoutjs
            window.Paytm.CheckoutJS.invoke();
        }).catch(function onError(error) {
            console.log("Error => ", error);
        });
    }
}
