import axios from 'axios'

// Create an axios instance with default configuration
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
})

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Add the API key to the headers
    config.headers['x-api-key'] = import.meta.env.VITE_API_KEY
    return config
  },
  function (error) {
    // Handle request errors
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Return the response data directly
    return response.data
  },
  function (error) {
    // Handle response errors
    let errorResponse = {
      status: error.response ? error.response.status : 'UNKNOWN',
      message: error.response ? error.response.data.message || 'Unknown error' : 'Network Error',
      data: error.response ? error.response.data : null
    }

    if (error.response) {
      // Log detailed error response if available
      console.error('Response error:', errorResponse)
    } else if (error.request) {
      // Log the request error if no response is received
      console.error('No response received:', error.request)
    } else {
      // Log any other error
      console.error('Error', error.message)
    }

    return Promise.reject(errorResponse)
  }
)

export default instance
