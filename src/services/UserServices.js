import axiosInstance from './base_axios.js'

axiosInstance.post('/login', {
  username: 'yourUsername',
  password: 'yourPassword',
})
.then(response => {
  console.log('Login successful:', response);
})
.catch(error => {
  console.error('Login failed:', error);
});