import axios from 'axios'
import { getCookie } from 'cookies-next'

const ownerCheck = async (profilePublicToken: string) => {
    const res = await axios.post(`${process.env.SERVER_BACKEND}/user-account-manager/account-owner-check`, {
        accountPrivateToken: getCookie('userToken'),
        accountPublicToken: getCookie('userPublicToken'),
        profilePublicToken: profilePublicToken
    })

    if (res.data.error === true) {
        window.alert('an error has ocurred!')
        return false
    }

    return res.data.isOwner
}

export { ownerCheck }
