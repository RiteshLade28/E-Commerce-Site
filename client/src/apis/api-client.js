import axios from "axios";
const BASEURL = process.env.BASEURL;

console.log("BASEURL", BASEURL);

const apiClient = axios.create({
  baseURL: `https://mern-store-backend1.onrender.com/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
