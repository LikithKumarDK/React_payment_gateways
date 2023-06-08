/**
 * Package imports
*/
// import axios from "axios";
import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import ReactDOM from "react-dom"
import { loadStripe } from '@stripe/stripe-js'
import SquarePaymentForm from './components/square/squarePayment'

/**
 * Local file imports
*/
import "./App.css";
import axios from "./config/axiosConfig";

/**
 * Internal declarations
*/
// const PayPalButton = paypal.Buttons.driver("react", { React, ReactDOM });

function App() {
  const [book, setBook] = useState({
    name: "The Fault In Our Stars",
    author: "John Green",
    img: "https://images-na.ssl-images-amazon.com/images/I/817tHNcyAgL.jpg",
    price: 250,
  });
  const [products, setProducts] = useState([
    {
      name: 'headphones 1',
      price: 30,
      id: crypto.randomUUID(),
      quantity: 1,
      img: ""
    },
    {
      name: 'headphones 2',
      price: 50,
      id: crypto.randomUUID(),
      quantity: 1,
      img: ""
    },
    {
      name: 'headphones 3',
      price: 120,
      id: crypto.randomUUID(),
      quantity: 1,
      img: ""
    }, {
      name: 'headphones 4',
      price: 324,
      id: crypto.randomUUID(),
      quantity: 1,
      img: ""
    },
  ]);

  /** Paypal configuration */
  const paypalInitialOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    // "data-client-token": "abc123xyz==",
  };

  /** Load stripe */
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)

  useEffect(() => {
    // loadScript("https://checkout.razorpay.com/v1/checkout.js");
  });

  /**
   * Dynamic razor pay checkout script loading
   * @param {*} src 
   * @returns 
  */
  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  const initPayment = (data) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: book.name,
      description: "Test Transaction",
      image: book.img,
      order_id: data.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post("/payment/verify", response);
        } catch (error) {
          console.log(error);
        }
      },
      // prefill: {
      //     name: "Likith Kumar D K",
      //     email: "temp@example.com",
      //     contact: "9999999999"
      // },
      // notes: {
      //     address: "Malleshwarm",
      // },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayment = async () => {
    try {
      const { data } = await axios.post("/payment/orders", { amount: book.price });
      initPayment(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Paypal functionality
  */
  const createOrder = async (info) => {
    // Order is created on the server and the order id is returned
    const { data } = await axios.post("/payment/create-paypal-order", {
      product: {
        description: "Test description",
        cost: "2",
      },
    });
    return data.id;
  };

  const onApprove = async (info) => {
    // Order is captured on the server and the response is returned to the browser
    const { data } = await axios.post("/payment/capture-paypal-order", {
      orderID: info.orderID
    });
    console.log(data, "end");
  };

  /**
   * Stripe functionality
  */
  const handleCheckout = async () => {
    const lineItems = products.map((item) => {
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name
          },
          unit_amount: item.price * 100 // because stripe interprets price in cents
        },
        quantity: item.quantity
      }
    })
    const { data } = await axios.post('/payment/checkout', { lineItems })
    const stripe = await stripePromise
    await stripe.redirectToCheckout({ sessionId: data.id })
  }

  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      <div className="App">
        <div className="book_container">
          <img src={book.img} alt="book_img" className="book_img" />
          <p className="book_name">{book.name}</p>
          <p className="book_author">By {book.author}</p>
          <p className="book_price">
            Price : <span>&#x20B9; {book.price}</span>
          </p>
        </div>

        {/* Payment buttons */}
        <div className="pay_btn_view">
          <button onClick={handlePayment} className="buy_btn">
            Razor pay
          </button>
          <PayPalButtons
            createOrder={(data, actions) => createOrder(data, actions)}
            onApprove={(data, actions) => onApprove(data, actions)}
          />
          <button onClick={handleCheckout} className="buy_btn">
            Stripe pay
          </button>
          <div>
            <SquarePaymentForm />
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export default App;