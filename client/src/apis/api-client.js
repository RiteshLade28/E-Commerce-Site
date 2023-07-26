import axios from "axios";
const BASEURL = process.env.BASEURL;

console.log("BASEURL", BASEURL);

const apiClient = axios.create({
  baseURL: `${BASEURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
