'use client'
import axios from 'axios'
import { useState, useEffect } from 'react'
import React from 'react'
import { getCookie } from 'cookies-next'
import { accLogout, deleteAccount } from '@/Auth-Security/Auth'
import OptionPicker from '@/Components/CommonUi/OptionPicker'
import PriceInput from '@/Components/CommonUi/PriceInput'
import { IAccoutSettingsPopup } from '../IAccountProfile'

const AccoutSettingsPopup = (props: IAccoutSettingsPopup) => {
    const [userName, setUserName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [Visibility, setVisibility] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [sport, setSport] = useState<string>('')
    const [accountType, setAccountType] = useState<string>('')
    const [accountPrice, setAccountPrice] = useState<number | undefined>(0)
    const userToken: string = getCookie('userToken') as string

    const [sure, setSure] = useState(false)

    useEffect(() => {
        setUserName(props.UserName)
        setEmail(props.UserEmail)
        setVisibility(props.UserVisibility)
        setDescription(props.UserDescription)
        setSport(props.Sport)
        setAccountType(props.AccountType)
        setAccountPrice(props.AccountPrice)
    }, [])

    const changeUserData = () => {
        axios
            .post(`${process.env.SERVER_BACKEND}/user-account-manager/change-user-data`, {
                userName: userName,
                userEmail: email,
                userDescription: description,
                sport: sport,
                price: accountPrice,
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
            // Router.reload()
        })
    }

    return (
        <>
            <form className="flex flex-col w-full items-center" onSubmit={changeUserData}>
                <h1 className="text-[#ffffff] text-xl">SETTINGS</h1>
                <hr color="#656565" className="w-[85%] mt-[1rem]" />
                <div className="flex flex-col self-center w-[80%]">
                    <div className="flex flex-col self-center w-full mt-[1.5rem]">
                        <h1 className="text-white">Username</h1>
                        <input
                            className="text-white mt-[1vh] bg-[#474084] h-12 border-none rounded-xl w-full placeholder:text-white indent-3"
                            onChange={e => {
                                setUserName(e.target.value)
                            }}
                            value={userName}
                            maxLength={10}
                            type="text"
                            placeholder="User Name..."
                        />
                    </div>

                    <div className="flex flex-col self-center w-full mt-[1.5rem]">
                        <h1 className="text-white">Email</h1>
                        <input
                            className="text-white mt-[1vh] bg-[#474084] h-12 border-none rounded-xl w-full placeholder:text-white indent-3"
                            type="email"
                            placeholder="Email..."
                            onChange={e => {
                                setEmail(e.target.value)
                            }}
                            value={email}
                        />
                    </div>

                    <div className="flex w-full flex-col self-center h-24 mt-7">
                        <h1 className="h1-sm text-white">Account Type</h1>
                        <OptionPicker label="Account Type" options={['Trainer', 'SportsPerson']} value={accountType} onChange={value => setAccountType(value)} />
                    </div>
                    <div className="flex w-full flex-col self-center h-24 mt-7">
                        <h1 className="h1-sm text-white">Account Type</h1>
                        <OptionPicker
                            label="Sport"
                            options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field)', 'Swimming', 'Powerlifting', 'Other']}
                            value={sport}
                            onChange={value => setSport(value)}
                        />
                    </div>
                    <div className="flex w-full self-center  mt-4 h-36 flex-col indent-3">
                        <h1 className="h1-sm text-white">Account Description</h1>
                        <textarea
                            className="bg-[#474084] rounded-xl mt-2 text-white resize-none "
                            placeholder="Description"
                            maxLength={100}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setDescription(e.target.value)
                            }}
                            rows={20}
                            value={description}
                        />
                    </div>
                    {props.AccountPrice === undefined ? null : (
                        <div className="flex flex-col w-full self-center mt-3  h-16">
                            <h1 className="h1-sm text-white ">Account Subscription Price</h1>
                            <PriceInput value={accountPrice!} onChange={setAccountPrice} />
                        </div>
                    )}
                    <div className="flex w-full flex-col self-center h-24 mt-7">
                        <h1 className="h1-sm text-white">Account Visibility</h1>
                        <OptionPicker label="Account Visibility" options={['public', 'private']} value={Visibility} onChange={value => setVisibility(value)} />
                    </div>
                    <button className="self-center w-full h-10 bg-[#474084] active:bg-[#3b366c]  mb-4 mt-auto  justify-center rounded-xl" onClick={() => changeUserData}>
                        <h1 className="self-center text-white text-lg">Update!</h1>
                    </button>
                </div>
            </form>

            <hr color="#656565" className="w-[85%] mt-[2.5rem]" />
            <div className="w-[65%]">
                <button
                    className="bg-[#575757] border-none text-white mt-[1.5rem] h-[2.5rem] w-full cursor-pointer hover:bg-[#525252] active:bg-[#2b2b2b]"
                    onClick={() => {
                        changePassword()
                    }}
                >
                    Change Password
                </button>
            </div>
            <hr color="#656565" className="w-[85%] mt-[1.5rem]" />
            <div className="w-[65%]">
                <button
                    className="bg-[#575757] border-none text-white mt-[1.5rem] h-[2.5rem] w-full cursor-pointer hover:bg-[#525252] active:bg-[#2b2b2b]"
                    onClick={() => {
                        accLogout()
                    }}
                >
                    Log Out
                </button>
            </div>
            <div className="flex w-[65%]">
                <button
                    className="bg-[#575757] border-none text-[#ad2c2c] mt-[1.5rem] h-[2.5rem] w-[60%] cursor-pointer hover:bg-[#525252] active:bg-[#2b2b2b]"
                    onClick={async () => {
                        const succesfullDeleted = await deleteAccount(sure, userToken)
                        if (succesfullDeleted) {
                            accLogout()
                        }
                    }}
                >
                    Delete Account
                </button>
                <h1 className="">Sure</h1>
                <input
                    className=""
                    type="checkbox"
                    name="Sure"
                    defaultChecked={false}
                    onChange={e => {
                        setSure(e.target.checked)
                    }}
                />
            </div>
        </>
    )
}

export default AccoutSettingsPopup
