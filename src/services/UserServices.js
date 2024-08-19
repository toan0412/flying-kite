import axiosInstance from './base_axios.js'

const loginAPI = (userInfo) => {
  return axiosInstance.post('/v1/api/users/login', userInfo)
}

const signUpAPI = (userInfo) => {
  return axiosInstance.post('v1/api/users/sign-up', userInfo)
}

const getUserAPI = () => {
  return axiosInstance.get('v1/api/users/info')
}

const searchUserAPI = (searchString) => {
  return axiosInstance.post('v1/api/users/search', { searchString })
}

const getAllUsersAPI = () => {
  return axiosInstance.get('v1/api/users')
}

export { loginAPI, signUpAPI, getUserAPI, searchUserAPI, getAllUsersAPI }
