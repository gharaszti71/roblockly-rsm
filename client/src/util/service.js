import axios from 'axios'

const conf = {
  baseURL: 'http://localhost:3000',
}

function error(e) {
    alert(e)
}

const login = async (name, password) => {
    sessionStorage.removeItem('token')
    try {
        const res = await axios.post('/users/login', { name, password }, conf)
        sessionStorage.setItem('token', res.data.token)
        return res.data.token
    } catch (e) {
        error(e)
    }
}

const isLoggedIn = () => {
    const token = sessionStorage.getItem('token')
    if (token) return true;
    return false;
}

const logout = () => {
    sessionStorage.removeItem('token')
}

const userList = async () => {
    try {
        const res = await axios.get('/users', conf)
        return res.data
    } catch (e) {
        error(e)
    }
}

export default {
    login,
    isLoggedIn,
    logout,
    userList
}