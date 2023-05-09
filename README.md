# fc-collect



## Installation

Use this script tag with the specific client id in "data-client-id" attribute in theme.liquid and thank you page

```bash
  <script src="https://static.farziengineer.co/fc-collect/root/script.js" id="fc-collect-19212" data-client-id="8f554ef8-b01a-4251-8840-d144c984183d"></script>
```
    
### Add to Cart event

add this code on addtocart button click. make sure to use this event after the window is loaded (window.onload)

```bash
  window.fc_addtocart({
        product_name:"",
        product_id:"",
        quantity: 1,
        product_price: 100,
        currency: "INR",
        variant:""
    })
```

### Begin checkout event

add this code on the proceed to checkout button. make sure to use this event after the window is loaded (window.onload)

```bash
  window.fc_begin_checkout({
        cart_amount:"",
        currency: "INR",
        items:[{
            item_id:7752304460032,
            item_name: "",
            currency: "INR",
            price: 100,
            quantity: 1
        }]
    })
```


### Purchase event

add this code on thank you page. make sure to use this event after the window is loaded (window.onload)

```bash
  window.fc_purchase({
        transaction_id:"",
        order_amount:"",
        tax: 0,
        shipping_charge: 0,
        currency: "INR",
        items:[{
            item_id:7752304460032,
            item_name: "",
            currency: "INR",
            price: 100,
            quantity: 1
        }]
    })
```


    
