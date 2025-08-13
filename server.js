// This is your test secret API key. 

// to use the .env file you need to install the dotenv  via npm install dotenv
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

const app = express();
const path = require('path');

app.use(express.static('public'));

//--------- derive the image url path -----------------
const imageBaseUrl = process.env.IMAGE_BASE_URL; // e.g., "https://cdn.example.com/"
//const imagePath = 'images/photo.jpg';
const imageUrl = `${imageBaseUrl}`;
console.log("imageURL:", imageUrl)




//----------- for testing using submit on heroku default --- 

app.get('/', (req, res) => {
  //res.sendFile(path.join(__dirname, 'public', 'submit.html'));
  res.sendFile(path.join(__dirname, 'public'));
});

//------------- direct call no FORM ---------------------------------------------
// DIRECT_SUBMIT https call to /submit route
//
app.get('/submit', async (req, res) => {      
  console.log('/submit before create checkout scession')
     const session = await stripe.checkout.sessions.create({
        //customer_email:'murraydesnoyer@hotmail.com',    // not substutite this with the email varriable from the HTTP push URL.
          // preset the checkout object
          //customer_email:email,
        customer_creation:"always", 
        line_items: [
          {
            
            // Provide the exact Price ID (for example, price_1234) of the product you want to sell price_1REaqoJz9K1DGkoKdW8pTe0F
            price: 'price_1REakMJz9K1DGkoKFgvTbLat',
            quantity: 1,
          },
        ],
        mode: 'payment',
        // customer_update: {   // stripe did like how I used it 
        //   name: 'auto',
        //   email: 'auto',
        // },
        // substute for production  note sessionID will enable us to get infor about the transaction. 
        //success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        //cancel_url: `${process.env.BASE_URL}/cancel.html`,
        success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,

        automatic_tax: {enabled: true},
      });
      console.log("Post await stripe checkout")
      //console.log("Email:",email)
      //console.log(session)
      //console.log("session.url:",session.url )
      //console.log('Stripe Checkout Session:', session);
      res.redirect(303, session.url);

    },
);

//---------------------------------------------------------

const PORT = process.env.PORT || 4242
console.log("Port:", PORT)

// // uses to storage user in addUser.js
const bodyParser = require('body-parser');
// const { addUser } = require(`./public/addUser`); 
// const getUser = require('./public/getUser');
//------

// --- used for nodemailer
const nodemailer = require('nodemailer')
const ejs = require('ejs')

const envLive = process.env.NODE_ENV_TEST;    // this environment varriable allows 
console.log(envLive);

// Note: for some reason the if structure prevents the transporter form being created
//       which forces to use commenting out either the live or test transporters.
// if (envLive === `live`){
  // create the mail transportor for production
  console.log(`using the live transporter`)
  const  transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,                      // non encrypted port
    secure: false,                  // upgrade later with STARTTLS
    auth: {
      user: "smtp@mailtrap.io",    //process.env.MAIL_ORIGIN_USER,
      pass: process.env.MAIL_ORIGIN_PASS,
    },
    tls:{
      rejectUnauthorized: false // Optional: allows self-signed certs (not recommended for production)
    }
   });

// } else {
// create the mail transporter function for testing

  // console.log(`using the sandbox transporter`)
  // const transporter = nodemailer.createTransport({
  //   host: "sandbox.smtp.mailtrap.io",
  //   port: 2525,
  //   //secure: false, // upgrade later with STARTTLS
  //   auth: {
  //     user: process.env.MAIL_SANDBOX_USER,
  //     pass: process.env.MAIL_SANDBOX_PASS,
  //   }
  // });
//};

// Optional: verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// ------------------------------------------------

// define  the send mail function
async function sendEmail(to, subject, template, data) {
    try {
        const html = await ejs.renderFile(__dirname + '/public/' + template + '.ejs', data, { async: true })
        const mailOptions = {
            from: 'no-reply@originintl.com',
            to,
            subject,
            //text: 'Simple email message from mjd test emailer'
            html
        }
        await transporter.sendMail(mailOptions)  
        console.log('Message sent successfully!')
    } catch (err) {
        console.log('Error: ', err)
    }
}
// ---

const YOUR_DOMAIN = 'http://localhost:4242';


//const app = express();  // defined above
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//-----

// --- using a stack --
// const express = require('express');     // defined above
// const app = express();                  // defined above
const userStack = [];   // define a user stact to save the URL contact information
//---------------

// main entry point to link to Stripe checkout -------------------------------------
app.post('/create-checkout-session', async (req, res) => {

      console.log('enter postcreate checkout')
    
    //--- jane19 -- extract from form created with the submit button see Submit.html 
    // in production will have to be from hubspot.  ?? may need the use of keys / authentication. 
      const { firstname, lastname, email, company } = req.body;
      console.log('Form Data:', req.body);

      //const { userName, email } = req.body; 
      userStack.push({ firstname, lastname, email , company }); 
      //console.log('stack Firstname: ', firstname, lastname, 'email:',email, `Company:`,company)
      //res.send('User pushed to stack'); 
      //console.log("after app.get")
     // console.log("FirstName:",firstname, "lastname: ", lastname)
     // console.log("Email:",email, "Company:", company)

    //--- june 19

      //const sessionId = req.body.sessionId;
      const session = await stripe.checkout.sessions.create({
        //customer_email:'murraydesnoyer@hotmail.com',    // not substutite this with the email varriable from the HTTP push URL.
        //customer_email:email,     // not entering the email forces the payment has to enter. Cannot preset unless we know the email
        line_items: [
          {
            // Provide the exact Price ID (for example, price_1234) of the product you want to sell price_1REaqoJz9K1DGkoKdW8pTe0F
            price: 'price_1REakMJz9K1DGkoKFgvTbLat',
            quantity: 1,
          },
        ],
        mode: 'payment',
        // substute for production  note sessionID will enable us to get infor about the transaction. 
        //success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        //success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        //cancel_url: `${process.env.BASE_URL}/cancel.html`,
        success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
        automatic_tax: {enabled: true},
      });
      console.log("Post await stripe checkout")
      //console.log("Email:",email)
      //console.log(session)
      //console.log("session.url:",session.url )

      res.redirect(303, session.url);

    },
 );

// on success return all info about the checkout scession along with the payment info also line items
app.get(`/complete`, async (req, res)  => {

  console.log("/complete")
  //console.log(req.query.session_id)
  //const session = await stripe.checkout.session.retrieve(req.query.session_id, {expand: ['payment_intent.payment_method']})
  //const lineItems = await stripe.checkout.sessions.listLineItems(req.query.session_id)  
  //console.log(req.query.session_id)
  //console.log(session)
  //console.log(lineItems)
  console.log('Your payment was successful')
  const sessionId = req.query.session_id;
 // add a try {}
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  //console.log(session)
  const customerName = session.customer_details?.name; 
  const customeremail = session.customer_details?.email   //customer.email;
  const data1 = {customerName:customerName, email: customeremail }
  console.log('data1:', data1)
  // sendEmail( customer.email, 'Welcome to Origin', 'welcomeMessage',  data1 )
  //sendEmail('janet.wiaderny@originintl.com', 'New ScanViz Customer', 'newCustomer',data1) 
  sendEmail( customeremail, 'Welcome to Origin', 'ThankyouforPurchasingScanViz',  data1 )
  sendEmail('janet.wiaderny@originintl.com', 'New ScanViz Customer', 'SomeoneBoughtScanVis',data1) 

  //console.log(session)
  res.redirect(`${process.env.HUBSPOT_SUCCESS_URL}`)

  //  // -- stack recall---------------- NOT used 05-aug-25
//  const user = userStack.pop(); 
//   if (user) { 
//     console.log(`Popped user: ${user.firstname}, ${user.lastname}, ${user.email}, ${user.company}`); 
//     const data1 = {firstname: user.firstname, lastname: user.lastname, email: user.email, company: user.company};                      // the template is looking for userName
//     console.log(data1);
//     // sendEmail(to, subject, template, data)
//     sendEmail(user.email, 'Welcome to Origin', 'welcomeMessage',  data1 )
//     sendEmail('janet.wiaderny@originintl.com', 'New ScanViz Customer', 'newScanVizCustomer',data1) 
//   } else { 
//     //res.send('Stack is empty'); 
//     res.redirect(`${process.env.HUBSPOT_FORM_URL}`)
//     //res.redirect(`/submit.html`)
//   } 
// // -------------------------------
// // console.log("userData: ",user)
// // console.log("Email:",user.email) 
// // console.log("UserName:",user.username)
// res.redirect(`/success.html`)     // redirect, in production it will be the url from hubspot scanViz success page. 
}), //---------------------------------------------------------------

// we use date and time to associate the cancel with the customer form 
app.get(`/cancel`, async (req, res) => {
  console.log('/cancel')
 const sessionId = req.query.session_id;
 console.log(sessionId)
  const now = new Date();

  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Toronto'
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);

  // Build the string manually to match the desired format
  const formatted = `${parts.find(p => p.type === 'weekday').value} ` +
                    `${parts.find(p => p.type === 'month').value} ` +
                    `${parts.find(p => p.type === 'day').value} ` +
                    `${parts.find(p => p.type === 'year').value} ` +
                    `${parts.find(p => p.type === 'hour').value}:` +
                    `${parts.find(p => p.type === 'minute').value}:`;
 // add a try {}
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log("after get checkout")
  //console.log(session)
  const customerId = session.customer;
  
  const customer = "an unknown customer";
  if (customerId){
    //const customer = await stripe.customers.retrieve(session.customer);
    customer = await stripe.customers.retrieve(customerId);
  }
  //console.log("after retreive customer and just before saving customer name")
  const customerName = customer;
  const customeremail = "No email address";   //customer.email;
  if(customer.email != null){
    const customeremail = customer.email;
  }
  // const customerName = customer.name;
  // const customeremail = session.customer_details?.email   //customer.email;
  //console.log("just before constructing the Data1")
  //const data1 = {customerName:customer.name, email: customer.email }
  const data1 = {customerName:customerName, email: customeremail, date: formatted, imageUrl: imageUrl }

  console.log('data1:', data1)
  // send Janet an email 
  //sendEmail('janet.wiaderny@originintl.com', 'Unsuccessful Payment', 'UnsuccessfulPayment',data1) 
  sendEmail('janet.wiaderny@originintl.com', 'Unsuccessful ScanViz Payment', 'UnsuccessfulScanVisOrder',data1)  
  //console.log(session)
  res.redirect(`${process.env.HUBSPOT_UNSUCCESSFUL_URL}`)

// // -- stack recall----------------
//  const user = userStack.pop(); 
//   if (user) { 
//     //res.send(`Popped user: ${user.name}, ${user.email}`); 
//     console.log(`Popped user: ${user.firstname}, ${user.lastname}, ${user.email}, ${user.company}`);  
//     const data1 = {firstname: user.firstname, lastname: user.lastname, email: user.email, company: user.company};
//   user.email 
//     // the template is looking for userName                    // the template is looking for userName
//     sendEmail(user.email, 'Unsuccessful Payment', 'UnsuccessfulPayment',data1) 
//   } else { 
//     res.redirect(`${process.env.HUBSPOT_FORM_URL}`)
//     //res.send('Stack is empty'); 
//   } 
// -------------------------------

  //res.redirect(`${process.env.HUBSPOT_UNSUCCESSFUL_URL}`)
  //res.redirect(`/submit.html`)     // redirect, in production it will be the url from hubspot cancel page. 
});

//sendEmail('murraydesnoyer@hotmail.com', 'New ScanViz Customer', 'newScanVizCustomer', { userName: 'Don Doe' })
//sendEmail('email@domain.com', 'Dynamic Email Template with EJS', 'welcomeMessage', { userName:'Don' })


//----------------------- production ------------------
// using heroku cinfig NODE_ENV to set directives. 
// NODE_ENV=`production`  or `local`
// NODE_ENV_TEST=`test`  or `live`  uses sandbox mailtrap and live uses live mailtrap smpt server
// ---
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === `production`){
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  app.listen(4242, () => console.log('http://localhost:4242/submit.html'));
}