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
  order: {
    get: "/orders/?id={id}",
    create: "/orders/?id={id}",
    update: "/orders/?id={id}",
    delete: "/orders/?id={id}",
  },
};

export default urls;
