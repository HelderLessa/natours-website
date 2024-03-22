import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51OwTJ1EVFieRNpYnMxgicVnDlAhiHcVaoM1GRoiGYwmLPwsq8xxzjnLr1GFmjvitVX5sXrvrqfWAGU6nsIXHfQlt00aLst4DJw'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chart credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
