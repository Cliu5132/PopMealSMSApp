const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  POUTINE: Symbol("poutine"),
  CHIP: Symbol("chip"),
  SIZE1: Symbol("size1"),
  SIZE2: Symbol("size2"),
  CAKE: Symbol("cake"),
  PAYMENT: Symbol("payment")
});

module.exports = class PopupOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize1 = "";
    this.sSize2 = "";
    this.sItem1 = "chip 2.0";
    this.sItem2 = "poutine";
    this.sItem3 = "chocolate freezer cake";
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.CHIP;
        aReturn.push("Welcome to HiLeX popup restaurant.");
        aReturn.push("Would you like to try our Chip 2.0 which is 2mm extra thick kettle-cooked with housemade ranch and freid shallots?");
        break;
      case OrderState.CHIP:
        if (sInput.toLowerCase() == "yes") {
          this.stateCur = OrderState.SIZE1;
          aReturn.push("What portion would you like? Small or Large?");
        } else if (sInput.toLowerCase() != "no") {
          aReturn.push("Would you like to try our Chip 2.0 which is 2mm extra thick kettle-cooked with housemade ranch and freid shallots? (Yes/No)");
        } else {
          this.stateCur = OrderState.POUTINE;
          aReturn.push("Would you like to try our signature poutine which has triple cooked fries, mushroom gravy and extra fresh cheese curds?");
        }
        break;
      case OrderState.SIZE1:
        if (sInput.toLowerCase() != "small" && sInput.toLowerCase() != "large") {
          aReturn.push("Please specify the size you would like? (small/large)")
        } else {
          this.stateCur = OrderState.POUTINE;
          this.sSize1 = sInput;
          aReturn.push("Would you like to try our signature poutine which has triple cooked fries, mushroom gravy and extra fresh cheese curds?");
        }
        break;
      case OrderState.POUTINE:
        if (sInput.toLowerCase() == "yes") {
          this.stateCur = OrderState.SIZE2;
          aReturn.push("What portion would you like? Small or Large?");
        } else if (sInput.toLowerCase() != "no") {
          aReturn.push("Would you like to try our signature poutine which has triple cooked fries, mushroom gravy and extra fresh cheese curds? (Yes/No)");
        } else {
          this.stateCur = OrderState.CAKE;
          aReturn.push("Would you like to try our Chocolate Freezer Cake which is frozen chocolate cake with piped icing?");
        }
        break;
      case OrderState.SIZE2:
        if (sInput.toLowerCase() != "small" && sInput.toLowerCase() != "large") {
          aReturn.push("Please specify the size you would like? (small/large)")
        } else {
          this.stateCur = OrderState.CAKE;
          this.sSize2 = sInput;
          aReturn.push("Would you like to try our Chocolate Freezer Cake which is frozen chocolate cake with piped icing?");
        }
        break;
      case OrderState.CAKE:
        if (sInput.toLowerCase() != "yes" && sInput.toLowerCase() != "no") {
          aReturn.push("Please answer YES or NO");
          break;
        }
        this.stateCur = OrderState.PAYMENT;
        if (sInput.toLowerCase() == "no") {
          this.sItem3 = "";
        }
        aReturn.push("Thank you for your order of");
        if (this.sSize1 != "") {
          aReturn.push(`${this.sSize1} ${this.sItem1}`);
        }
        if (this.sSize2 != ""){
          aReturn.push(`${this.sSize2} ${this.sItem2}`);
        }
        if (this.sItem3 != "") {
          aReturn.push(this.sItem3);
        }
        let total = 0;
        // add the price of chips based on size
        if (this.sSize1.toLowerCase() == "large") {
          total += 6.99;
        } else if (this.sSize1.toLowerCase() == "small") {
          total += 4.99;
        }
        // add the price of poutine based on size
        if (this.sSize2.toLowerCase() == "large") {
          total += 7.99;
        } else if (this.sSize2.toLowerCase() == "small") {
          total += 5.99;
        }
        // add the price of cake
        if (this.sItem3 != "") {
          total += 5.99;
        }
        // calculate total price after 13% sales tax;
        total *= 1.13;
        this.nOrder = total.toFixed(2);
        aReturn.push(`Your total plus HST is $${total.toFixed(2)}`);
        aReturn.push(`Please pay for your order here`);
        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        break;
      case OrderState.PAYMENT:
        console.log(sInput);
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 40);
        if (typeof (sInput.purchase_units[0].shipping.address.address_line_2) == 'undefined') {
          aReturn.push(`Your order will be delivered to ${sInput.purchase_units[0].shipping.address.address_line_1} 
                  ${sInput.purchase_units[0].shipping.address.admin_area_2} 
                  ${sInput.purchase_units[0].shipping.address.admin_area_1} at ${d.toTimeString()}`);
        } else {
          aReturn.push(`Your order will be delivered to ${sInput.purchase_units[0].shipping.address.address_line_1} 
                  ${sInput.purchase_units[0].shipping.address.address_line_2}
                  ${sInput.purchase_units[0].shipping.address.admin_area_2} 
                  ${sInput.purchase_units[0].shipping.address.admin_area_1} at ${d.toTimeString()}`);
        }
        break;
    }
    return aReturn;
  }
  renderForm() {
    // your client id should be kept private
    const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=AUYV1WXlK0tpcIlBxHi2d-90tKGp7FZ7Mtn7cDVqpvJr7uVsrgwU7MifiqVPc4jo3rNc4Nkh64hZcLax"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}