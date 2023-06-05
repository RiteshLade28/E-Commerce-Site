const urls = {
    auth: {
      login: "/auth/login/",
      signup: "/auth/signup",
    },
    checkauth:{
      get: "/checkauth",
    },
    cart: {
      get: "/cartItems/",
      create: "/cartItem/",
      update: "/updateCartItem/",
      delete: "/cartItem?id={id}",
    },
    product: {
      get: "/products/",
    },
    user: {
      get: "/auth/users",
    },
  };
  
  export default urls;
  