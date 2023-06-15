import React, { useState, createContext, useEffect } from "react";

const OrderAddressContext = createContext(null);
const NextStepContext = createContext(null);
const OrderPaymentContext = createContext(null);
const IdContext = createContext(null);
const PlaceOrder = createContext(null);

const address = {
  firstName: "",
  lastName: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
  country: "",
};

const payment = {
  cardName: "",
  cardNumber: "",
  expDate: "",
  cvv: "",
};

const Store = ({ children }) => {
  const [orderAddress, setOrderAddress] = useState(address);
  const [nextStep, setNextStep] = useState(false);
  const [orderPayment, setOrderPayment] = useState(payment);
  const [id, setId] = useState(null);
  const [placeOrder, setPlaceOrder] = useState(false);

  return (
    <PlaceOrder.Provider value={{ placeOrder, setPlaceOrder }}>
      <IdContext.Provider value={{ id, setId }}>
        <OrderPaymentContext.Provider value={{ orderPayment, setOrderPayment }}>
          <NextStepContext.Provider value={{ nextStep, setNextStep }}>
            <OrderAddressContext.Provider
              value={{ orderAddress, setOrderAddress }}
            >
              {children}
            </OrderAddressContext.Provider>
          </NextStepContext.Provider>
        </OrderPaymentContext.Provider>
      </IdContext.Provider>
    </PlaceOrder.Provider>
  );
};
export default Store;
export {
  OrderAddressContext,
  NextStepContext,
  OrderPaymentContext,
  IdContext,
  PlaceOrder,
};
