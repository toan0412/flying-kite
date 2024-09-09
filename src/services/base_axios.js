import axios from 'axios'

const AuthFail = [
  'invalid signature',
  'jwt has expired',
  'jwt malformed',
  'verify jwt failed',
  'jwt expired'
]

// Create an axios instance with default configuration
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
})

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Add the API key to the headers
    config.headers['x-api-key'] = import.meta.env.VITE_API_KEY

    // Get token and userId at request time to ensure they are up to date
    const accessToken = localStorage.getItem('accessToken')
    const userId = localStorage.getItem('userId')

    if (accessToken) {
      config.headers['Authorization'] = accessToken
    }
    if (userId) {
      config.headers['x-client-id'] = userId
    }

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
      AuthFail.forEach((errorMessage) => {
        if (errorResponse.message == errorMessage) {
          localStorage.clear()
          window.location.reload()
        }
      })
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
