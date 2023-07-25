import axios from "axios";
const BASEURL = process.env.BASEURL;

console.log("BASEURL", BASEURL);

const apiClient = axios.create({
  baseURL: `http://localhost:5000/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
