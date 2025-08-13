# Accept a Payment with Stripe Checkout

Stripe Checkout is the fastest way to get started with payments. The workflow is a FORM commit html call from 
Hubspot. To the returned Checkout scession from stripe we add the item, Succsee route, Cancel route. These 
Routes then send out the approperiate email templete and returns the customer to Hubspot correct URL.
This package uses, nodejs, mailtrap, Hubspot, Stripe API Checkout.
05-Aug-25
Mailtrap smpt server has two modes which are managed by comments in server.js
    1) Sandbok which traps the emails for analysis
    2) live.smtp.mailtrap.io
There a environment verriable which set the following
    NODE_ENV = local        # local or production
    NODE_ENV_TEST = test    # test or live
Production: Heroku uses browser DIRECT_SUBMIT
Local: BASE_URL in the browser for testing

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

~~~git
npm start
~~~

3. Go to [http://localhost:4242/checkout.html](http://localhost:4242/checkout.html)