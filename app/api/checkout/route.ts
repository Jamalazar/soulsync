import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your Secret Key
// NOTE: This will fail if you haven't added STRIPE_SECRET_KEY to .env.local yet.
// That is okay! We are just building the structure now.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia', 
});

export async function POST(req: Request) {
  try {
    const { testId } = await req.json();

    // Create the Payment Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SoulSync Premium Report',
              description: 'Unlock full compatibility breakdown & deep dive.',
            },
            unit_amount: 199, // $1.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        testId: testId,
      },
      // Dynamic URL based on where the user is (localhost or production)
      success_url: `${req.headers.get('origin')}/results/${testId}?success=true`,
      cancel_url: `${req.headers.get('origin')}/results/${testId}?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}