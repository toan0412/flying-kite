import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
})

const token = localStorage.getItem('accessToken');

// Add a request interceptor to add headers
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lies within the range of 2xx causes this function to trigger
    // Do something with response data
    return response.data
  },
  function (error) {
    // Any status codes that fall outside the range of 2xx cause this function to trigger
    // Do something with response error
    let res = {}
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.data = error.response.data
      res.status = error.response.status
      res.headers = error.response.headers
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      // and an instance of http.ClientRequest in Node.js
      console.log(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    return Promise.reject(error)
  }
)

export default instance
