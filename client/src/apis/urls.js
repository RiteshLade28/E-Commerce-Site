const urls = {
  auth: {
    login: "/auth/login/",
    signup: "/auth/signup",
    sellerSignUp: "/auth/seller/signup/",
    sellerLogin: "/auth/seller/login/",
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
  getDashboardData:{
    get: "/seller/dashboard/",
  },
  sellerOrders: {
    get: "/seller/orders/",
    patch: "/seller/orders/",
  },
  sellerProducts:{
    get: "/seller/products/",
    add: "/seller/products/",
  }
};

export default urls;
