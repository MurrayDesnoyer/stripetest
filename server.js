// This is your test secret API key. 

// to use the .env file you need to install the dotenv  via npm install dotenv
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

const app = express();
const path = require('path');
app.use(express.static('public'));


// // uses to storage user in addUser.js
const bodyParser = require('body-parser');
// const { addUser } = require(`./public/addUser`); 
// const getUser = require('./public/getUser');
//------


// --- used for nademailer
const nodemailer = require('nodemailer')
const ejs = require('ejs')

// create the mail transp[orter function
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  //secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.MAIL_SANDBOX_USER,
    pass: process.env.MAIL_SANDBOX_PASS,
  }
});

// define  the send mail function
async function sendEmail(to, subject, template, data) {
    try {
        const html = await ejs.renderFile(__dirname + '/public/' + template + '.ejs', data, { async: true })
        
        const mailOptions = {
            from: 'support@originintl.com',
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
// const express = require('express');   // defined above
// const app = express();                  // defined above
 
//app.use(express.json()); 
const userStack = [];

//---------------

// main entry point to link to Stripe checkout -------------------------------------
app.post('/create-checkout-session', async (req, res) => {

  console.log('enter postcreate checkout')

 
//--- jane19 -- extract from form created with the submit button see Submit.html 
// in production will have to be from hubspot.  ?? may need the use of keys / authentication. 
  const { username, email } = req.body;
  console.log('Form Data:', req.body);

  //const { userName, email } = req.body; 
  userStack.push({ username, email }); 
  console.log('stack name: ', username, 'email:',email)
  //res.send('User pushed to stack'); 
 



  //res.send(`Received submission: ${username} (${email})`);
   console.log("after app.get")
   console.log("UserName:",username)
   console.log("Email:",email)

//--- june 19

  //const sessionId = req.body.sessionId;
  const session = await stripe.checkout.sessions.create({
    //customer_email:'murraydesnoyer@hotmail.com',    // not substutite this with the email varriable from the HTTP push URL.
  
         customer_email:email,
    line_items: [
      {
        
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell price_1REaqoJz9K1DGkoKdW8pTe0F
        price: 'price_1REakMJz9K1DGkoKFgvTbLat',
        quantity: 1,
      },
    ],
    mode: 'payment',
    // success_url: `${YOUR_DOMAIN}/success.html`,  
    // cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    // substute for production  note sessionID will enable us to get infor about the transaction. 
    //success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    //success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    //cancel_url: `${process.env.BASE_URL}/cancel.html`,
    success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,

    automatic_tax: {enabled: true},
  });
  console.log("Post await stripe checkout")
  console.log("Email:",email)
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
 // -- stack recall----------------
 const user = userStack.pop(); 
  if (user) { 
    console.log(`Popped user: ${user.username}, ${user.email}`); 
    const data1 = {userName: user.username};                      // the template is looking for userName
    console.log(data1);
    // sendEmail(to, subject, template, data)
    sendEmail(user.email, 'Welcome to Origin', 'welcomeMessage',  data1 )
    sendEmail('sales@originintl.com', 'New ScanViz Customer', 'newScanVizCustomer',data1) 
  } else { 
    res.send('Stack is empty'); 
    res.redirect(`${process.env.HUBSPOT_FORM_URL}`)
    //res.redirect(`/submit.html`)
  } 
// -------------------------------
  // console.log("userData: ",user)
  // console.log("Email:",user.email) 
  // console.log("UserName:",user.username)
  res.redirect(`/success.html`)     // redirect, in production it will be the url from hubspot scanViz success page. 
}), //---------------------------------------------------------------

app.get(`/cancel`, (req, res) => {
  console.log('/cancel')
// -- stack recall----------------
 const user = userStack.pop(); 
  if (user) { 
    //res.send(`Popped user: ${user.name}, ${user.email}`); 
    console.log(`Popped user: ${user.username}, ${user.email}`); 
    const data1 = {userName: user.username};                      // the template is looking for userName
    sendEmail(user.email, 'New ScanViz Customer', 'newScanVizCustomer',data1) 
  } else { 
    res.redirect(`${process.env.HUBSPOT_FORM_URL}`)
    //res.send('Stack is empty'); 
  } 
// -------------------------------

  // console.log("userData: ",user)
  // console.log("Email:",user.email) 
  // console.log("UserName:",user.username)
  res.redirect(`${process.env.HUBSPOT_UNSUCCESSFUL_URL}`)
  //res.redirect(`/submit.html`)     // redirect, in production it will be the url from hubspot cancel page. 
});

//sendEmail('murraydesnoyer@hotmail.com', 'New ScanViz Customer', 'newScanVizCustomer', { userName: 'Don Doe' })
//sendEmail('email@domain.com', 'Dynamic Email Template with EJS', 'welcomeMessage', { userName:'Don' })

app.listen(4242, () => console.log('http://localhost:4242/submit.html'));