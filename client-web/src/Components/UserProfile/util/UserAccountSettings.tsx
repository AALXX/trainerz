'use client'
import axios from 'axios'
import { useState, useEffect } from 'react'
import React from 'react'
import { getCookie } from 'cookies-next'
import { accLogout, deleteAccount } from '@/Auth-Security/Auth'
import OptionPicker from '@/Components/CommonUi/OptionPicker'
import PriceInput from '@/Components/CommonUi/PriceInput'
import { IAccoutSettingsPopup } from '../IAccountProfile'

const AccountSettingsPopup = (props: IAccoutSettingsPopup) => {
    const [userName, setUserName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [Visibility, setVisibility] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [sport, setSport] = useState<string>('')
    const [accountType, setAccountType] = useState<string>('')
    const userToken: string = getCookie('userToken') as string

    const [sure, setSure] = useState(false)

    useEffect(() => {
        setUserName(props.UserName)
        setEmail(props.UserEmail)
        setVisibility(props.UserVisibility)
        setDescription(props.UserDescription)
        setSport(props.Sport)
        setAccountType(props.AccountType)
    }, [])

    const changeUserData = () => {
        axios
            .post(`${process.env.SERVER_BACKEND}/user-account-manager/change-user-data`, {
                userName: userName,
                userEmail: email,
                userDescription: description,
                sport: sport,
                accountType: accountType,
                userVisibility: Visibility,
                userPrivateToken: userToken
            })
            .then(res => {
                if (res.data.error) {
                    window.alert('error')
                }
                window.location.reload()
            })
            .catch(err => {
                if (err) {
                    window.alert(`error, ${err.message}`)
                }
            })
    }

    const changePassword = () => {
        axios.post(`${process.env.SERVER_BACKEND}/user-account/change-user-password-check-link`, { userEmail: props.UserEmail }).then(res => {
            if (res.data.error) {
                window.alert('error')
            }
        })
    }

    return (
        <div className="flex flex-col items-center w-full px-4 py-6 space-y-6">
            <form className="flex flex-col w-full max-w-3xl items-center space-y-6" onSubmit={changeUserData}>
                <h1 className="text-white text-xl">SETTINGS</h1>
                <hr className="w-full border-gray-500" />
                <div className="flex flex-col w-full space-y-6">
                    <div className="flex flex-col w-full">
                        <h1 className="text-white">Username</h1>
                        <input
                            className="text-white mt-2 bg-[#474084] h-12 border-none rounded-xl w-full placeholder:text-white px-3"
                            onChange={e => setUserName(e.target.value)}
                            value={userName}
                            maxLength={10}
                            type="text"
                            placeholder="User Name..."
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <h1 className="text-white">Email</h1>
                        <input
                            className="text-white mt-2 bg-[#474084] h-12 border-none rounded-xl w-full placeholder:text-white px-3"
                            type="email"
                            placeholder="Email..."
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <h1 className="text-white">Account Type</h1>
                        <OptionPicker label="Account Type" options={['Trainer', 'SportsPerson']} value={accountType} onChange={value => setAccountType(value)} />
                    </div>
                    <div className="flex flex-col w-full">
                        <h1 className="text-white">Sport</h1>
                        <OptionPicker
                            label="Sport"
                            options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                            value={sport}
                            onChange={value => setSport(value)}
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <h1 className="text-white">Account Description</h1>
                        <textarea
                            className="bg-[#474084] rounded-xl mt-2 text-white resize-none p-3"
                            placeholder="Description"
                            maxLength={100}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            value={description}
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <h1 className="text-white">Account Visibility</h1>
                        <OptionPicker label="Account Visibility" options={['public', 'private']} value={Visibility} onChange={value => setVisibility(value)} />
                    </div>
                    <button className="w-full h-10 bg-[#474084] active:bg-[#3b366c] mb-4 rounded-xl text-white text-lg" type="submit">
                        Update!
                    </button>
                </div>
            </form>
            <hr className="w-full max-w-3xl border-gray-500" />
            <div className="w-full max-w-3xl space-y-6">
                <button className="w-full h-10 bg-[#474084] active:bg-[#3b366c] rounded-xl text-white text-lg" onClick={changePassword}>
                    Change Password!
                </button>
                <hr className="border-gray-500" />
                <button className="w-full h-10 bg-[#474084]  active:bg-[#3b366c] rounded-xl text-white" onClick={accLogout}>
                    Log Out
                </button>
                <div className="flex items-center space-x-4">
                    <button
                        className="w-full h-10 bg-[#474084]  active:bg-[#3b366c]  rounded-xl text-[#ad2c2c]"
                        onClick={async () => {
                            const succesfullDeleted = await deleteAccount(sure, userToken)
                            if (succesfullDeleted) {
                                accLogout()
                            }
                        }}
                    >
                        Delete Account
                    </button>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-white">Sure</h1>
                        <input className="h-5 w-5" type="checkbox" name="Sure" checked={sure} onChange={e => setSure(e.target.checked)} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountSettingsPopup
