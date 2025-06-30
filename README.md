# Accept a Payment with Stripe Checkout

Stripe Checkout is the fastest way to get started with payments. The workflow is a FORM commit html call from 
Hubspot. To the returned Checkout scession from stripe we add the item, Succsee route, Cancel route. These 
Routes then send out the approperiate email templete and frturns the customer to Hubspot correct URL.
This package uses, nodejs, mailtrap, Hubspot, Stripe API Checkout.

## Set Price ID

In the back end code, replace `price_1REaqoJz9K1DGkoKdW8pTe0F` with a Price ID (`price_xxx`) that you created.

## Running the sample

1. Build the server

~~~
npm install
~~~ or
npm install -g npm@11.4.1  - to install that version
~~~

2. Run the server

~~~
npm start
~~~

3. Go to [http://localhost:4242/checkout.html](http://localhost:4242/checkout.html)