import axiosInstance from './base_axios.js'

const loginAPI = (userInfo) => {
  return axiosInstance.post('/v1/api/users/login', userInfo)
}

const signUpAPI = (userInfo) => {
  return axiosInstance.post('v1/api/users/sign-up', userInfo)
}

const logoutAPI = () => {
  return axiosInstance.post('v1/api/users/logout')
}

const getUserAPI = () => {
  return axiosInstance.get('v1/api/users/info')
}

const getUserByIdAPI = (userId) => {
  return axiosInstance.get(`v1/api/users/${userId}`)
}

const searchUserAPI = (searchString) => {
  return axiosInstance.post('v1/api/users/search', { searchString })
}

const getAllUsersAPI = () => {
  return axiosInstance.get('v1/api/users')
}

const updateUserAPI = (userInfo) => {
  const { fullName, email } = userInfo
  return axiosInstance.patch('/v1/api/users/update', { fullName, email })
}

export {
  loginAPI,
  signUpAPI,
  getUserAPI,
  searchUserAPI,
  getAllUsersAPI,
  logoutAPI,
  updateUserAPI,
  getUserByIdAPI
}
