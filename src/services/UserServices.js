import axiosInstance from './base_axios.js'

const loginAPI = (userInfo) => {
  return axiosInstance.post('/v1/api/user/login', userInfo)
}

const signUpAPI = (userInfo) => {
  return axiosInstance.post('v1/api/user/sign-up', userInfo)
}

const getUserAPI = (accessToken, userId) => {
  const params = { accessToken, userId }

  const config = {
    headers: {
      'x-client-id': `${userId}`,
      Authorization: `${accessToken}`
    }
  }

  return axiosInstance.post('v1/api/user/info', params, config)
}

export { loginAPI, signUpAPI, getUserAPI }
