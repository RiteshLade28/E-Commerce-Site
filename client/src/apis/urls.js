const urls = {
  auth: {
    login: "/auth/login/",
    signup: "/auth/signup",
  },
  checkauth: {
    get: "/checkauth",
  },
  cart: {
    get: "/cartItems/",
    create: "/cartItem?id={id}",
    update: "/cartItem?id={id}",
    delete: "/cartItem?id={id}",
  },
  product: {
    get: "/products/?id={id}",
  },
  user: {
    get: "/auth/users",
  },
};

export default urls;
