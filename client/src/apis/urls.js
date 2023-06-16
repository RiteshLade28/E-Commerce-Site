const urls = {
  auth: {
    login: "/auth/login/",
    signup: "/auth/signup",
    sellerSignUp: "/auth/seller/signup/",
  },
  checkauth: {
    get: "/checkauth",
  },
  cart: {
    get: "/cartItems/",
    create: "/cartItem?id={id}",
    update: "/cartItem?id={id}",
    delete: "/cartItem?id={id}",
    deleteAll: "/cartItems/",
  },
  product: {
    get: "/products/?id={id}",
  },
  user: {
    get: "/auth/users",
  },
  order: {
    get: "/orders/",
    create: "/orders/?id={id}",
    createCart: "/orders/cart/",
    update: "/orders/?id={id}",
    delete: "/orders/?id={id}",
  },
  category: {
    get: "/categories/",
    create: "/categories/",
  },
};

export default urls;
