import axios from 'axios'
import { setCookie, getCookie, deleteCookie } from 'cookies-next'

const ownerCheck = async () => {
    const res = await axios.post(`${process.env.SERVER_BACKEND}/user-account-manager/account-owner-check`, {
        accountPrivateToken: getCookie('userToken'),
        accountPublicToken: getCookie('userPublicToken')
    })

    if (res.data.error === true) {
        window.alert('an error has ocurred!')
        return false
    }

    return res.data.isOwner
}

export { ownerCheck }
