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
        <div className="flex w-full flex-col items-center space-y-6 px-4 py-6">
            <form className="flex w-full max-w-3xl flex-col items-center space-y-6" onSubmit={changeUserData}>
                <h1 className="text-xl text-white">SETTINGS</h1>
                <hr className="w-full border-gray-500" />
                <div className="flex w-full flex-col space-y-6">
                    <div className="flex w-full flex-col">
                        <h1 className="text-white">Username</h1>
                        <input
                            className="mt-2 h-12 w-full rounded-xl border-none bg-[#474084] px-3 text-white placeholder:text-white"
                            onChange={e => setUserName(e.target.value)}
                            value={userName}
                            maxLength={10}
                            type="text"
                            placeholder="User Name..."
                        />
                    </div>
                    <div className="flex w-full flex-col">
                        <h1 className="text-white">Email</h1>
                        <input
                            className="mt-2 h-12 w-full rounded-xl border-none bg-[#474084] px-3 text-white placeholder:text-white"
                            type="email"
                            placeholder="Email..."
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>
                    <div className="flex w-full flex-col">
                        <h1 className="text-white">Account Type</h1>
                        <OptionPicker label="Account Type" options={['Trainer', 'SportsPerson']} value={accountType} onChange={value => setAccountType(value)} />
                    </div>
                    <div className="flex w-full flex-col">
                        <h1 className="text-white">Sport</h1>
                        <OptionPicker
                            label="Sport"
                            options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                            value={sport}
                            onChange={value => setSport(value)}
                        />
                    </div>
                    <div className="flex w-full flex-col">
                        <h1 className="text-white">Account Description</h1>
                        <textarea
                            className="mt-2 resize-none rounded-xl bg-[#474084] p-3 text-white"
                            placeholder="Description"
                            maxLength={100}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            value={description}
                        />
                    </div>
                    <div className="flex w-full flex-col">
                        <h1 className="text-white">Account Visibility</h1>
                        <OptionPicker label="Account Visibility" options={['public', 'private']} value={Visibility} onChange={value => setVisibility(value)} />
                    </div>
                    <button className="mb-4 h-10 w-full rounded-xl bg-[#474084] text-lg text-white active:bg-[#3b366c]" type="submit">
                        Update!
                    </button>
                </div>
            </form>
            <hr className="w-full max-w-3xl border-gray-500" />
            <div className="w-full max-w-3xl space-y-6">
                <button className="h-10 w-full rounded-xl bg-[#474084] text-lg text-white active:bg-[#3b366c]" onClick={changePassword}>
                    Change Password!
                </button>
                <hr className="border-gray-500" />
                <button className="h-10 w-full rounded-xl bg-[#474084] text-white active:bg-[#3b366c]" onClick={accLogout}>
                    Log Out
                </button>
                <div className="flex items-center space-x-4">
                    <button
                        className="h-10 w-full rounded-xl bg-[#474084] text-[#ad2c2c] active:bg-[#3b366c]"
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
