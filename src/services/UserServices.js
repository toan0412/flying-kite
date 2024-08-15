import axiosInstance from './base_axios.js'

const loginAPI = (userInfo) => {
  return axiosInstance.post('/v1/api/user/login', userInfo)
}

const signUpAPI = (userInfo) => {
  return axiosInstance.post('v1/api/user/sign-up', userInfo)
}

const getUserAPI = () => {
  return axiosInstance.get('v1/api/user/info')
}

const searchUserAPI = (searchString) => {
  return axiosInstance.post('v1/api/user/search', { searchString })
}

export { loginAPI, signUpAPI, getUserAPI, searchUserAPI }
