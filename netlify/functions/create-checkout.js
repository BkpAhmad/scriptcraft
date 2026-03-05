const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, orderData } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: orderData.service + ' — ' + orderData.topic,
            description: orderData.pages + ' pages · ' + orderData.deadline,
          },
          unit_amount: Math.round(parseFloat(amount.replace('$','')) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://YOUR-SITE.netlify.app/?order=success&id=' + orderData.id,
      cancel_url: 'https://YOUR-SITE.netlify.app/?order=cancelled',
      customer_email: orderData.email,
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
