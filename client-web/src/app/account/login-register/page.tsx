'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { accLoginFunc, accRegisterFunc } from '@/Auth-Security/Auth'
import BirthDateSelectorComponent from '@/Components/CommonUi/BirthDatePicker'
import OptionPicker from '@/Components/CommonUi/OptionPicker'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import PriceInput from '@/Components/CommonUi/PriceInput'

/**
 * Login-Register-Screen
 * @return {jsx}
 */
export default function LoginRegisterScreen() {
    const [registerForm, setRegisterForm] = useState(false)
    const router = useRouter()

    // *-----------------------Register_Props-----------------------//
    const [registerUserName, setRegisterUserName] = useState<string>('')
    const [registerEmail, setRegisterEmail] = useState<string>('')
    const [registerPassword, setRegisterPassword] = useState<string>('')
    const [registerRepetedPassword, setRegisterRepeatedPassword] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [accountType, setAccountType] = useState<string>('')
    const [sport, setSport] = useState<string>('')
    const [accountPrice, setAccountPrice] = useState<number>(5)
    const [userBirthDate, setUserBirthDate] = useState<Date>(new Date())
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [locationLat, setLocationLat] = useState<number>(0)
    const [locationLon, setLocationLon] = useState<number>(0)

    // *-----------------------Login_Props-----------------------//
    const [loginEmail, setLoginEmail] = useState<string>('')
    const [loginPassword, setLoginPassword] = useState<string>('')
    const [componentToShow, setComponentToShow] = useState<string>('firstTab')

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            const { latitude, longitude } = coords
            setLocationLat(latitude)
            setLocationLon(longitude)
        })
    }, [])

    const renderComponent = () => {
        switch (componentToShow) {
            case 'firstTab':
                return (
                    <form className="flex flex-col h-full  w-full flex-grow-0 mt-4">
                        <div className="flex flex-col w-[85%] self-center h-24">
                            <h1 className="h1-sm text-white">UserName</h1>
                            <input
                                className="text-white bg-[#474084] h-[6vh] mt-3 indent-3 rounded-xl"
                                placeholder="UserName..."
                                type="text"
                                value={registerUserName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setRegisterUserName(e.target.value)
                                }}
                            />
                        </div>
                        <div className="flex flex-col w-[85%] self-center mt-4  h-24">
                            <h1 className="h1-sm text-white">Email</h1>
                            <input
                                className="text-white bg-[#474084] h-[6vh] mt-3 indent-3 rounded-xl"
                                placeholder="Email..."
                                value={registerEmail}
                                autoCapitalize="none"
                                type="email"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setRegisterEmail(e.target.value)
                                }}
                            />
                        </div>
                        <div className="flex w-[85%] flex-col self-center h-26 mt-4">
                            <h1 className="h1-sm text-white">What's your birth date?</h1>
                            <BirthDateSelectorComponent onDateChange={setUserBirthDate} />
                        </div>
                        <div className="flex w-[85%] flex-col self-center h-24 mt-7">
                            <h1 className="h1-sm text-white">Register as</h1>
                            <OptionPicker label="Account Type" options={['Trainer', 'SportsPerson']} value={accountType} onChange={value => setAccountType(value)} />
                        </div>
                        <button className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-2 mt-auto  justify-center rounded-xl" onClick={() => setComponentToShow('secondTab')}>
                            <h1 className="self-center text-white text-lg">Next</h1>
                        </button>
                    </form>
                )
            case 'secondTab':
                return (
                    <form className="flex h-full w-full flex-col">
                        <div className="flex w-[85%] self-center  mt-4 h-36 flex-col">
                            <h1 className="h1-sm text-white">Tell us about you</h1>
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
                        <div className="flex flex-col w-[85%] self-center  mt-4 h-24">
                            <h1 className="h1-sm text-white">I train / i want to learn sport</h1>
                            <OptionPicker
                                label="Select Sport"
                                options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Other']}
                                value={sport}
                                onChange={value => setSport(value)}
                            />
                        </div>

                        <div className="mt-auto self-center w-full flex flex-col ">
                            <button className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-4 mt-auto  justify-center rounded-xl" onClick={() => setComponentToShow('firstTab')}>
                                <h1 className="self-center text-white text-lg">Go Back</h1>
                            </button>
                            <button className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-2 mt-auto  justify-center rounded-xl" onClick={() => setComponentToShow('thirdTab')}>
                                <h1 className="self-center text-white text-lg">Next</h1>
                            </button>
                        </div>
                    </form>
                )
            case 'thirdTab':
                return (
                    <form className="flex flex-col h-full w-full">
                        {accountType === 'Trainer' ? (
                            <div className="flex w-full self-center  mt-4 h-full flex-col ">
                                <div className="flex flex-col w-[85%] self-center mt-5  ">
                                    <h1 className="h1-sm text-white">Phone Number</h1>
                                    <PhoneInput defaultCountry="ro" value={phoneNumber} onChange={phone => setPhoneNumber(phone)} className="mt-2 " />
                                </div>
                                <div className="flex flex-col w-[85%] self-center mt-1 h-24 ">
                                    <h1 className="text-white mt-4">Password</h1>
                                    <input
                                        className="text-white bg-[#474084] h-[6vh] mt-2 indent-3 rounded-xl"
                                        placeholder="Password..."
                                        value={registerPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col w-[85%] self-center mt-1 h-24 ">
                                    <h1 className="text-white mt-4">Repeat Password</h1>
                                    <input
                                        className="text-white bg-[#474084] h-[6vh] mt-2 indent-3 rounded-xl"
                                        placeholder="Password..."
                                        value={registerRepetedPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterRepeatedPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col w-[85%] self-center mt-3  h-16">
                                    <h1 className="h1-sm text-white ">Account Subscription Price</h1>
                                    <PriceInput value={accountPrice} onChange={setAccountPrice} />
                                </div>

                                <div className="mt-auto self-center w-full flex flex-col ">
                                    <button className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-4 mt-auto  justify-center rounded-xl" onClick={() => setComponentToShow('secondTab')}>
                                        <h1 className="self-center text-white text-lg">Go Back</h1>
                                    </button>
                                    <button
                                        className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-2 mt-auto  justify-center rounded-xl"
                                        onClick={async e => {
                                            e.preventDefault()
                                            const succesfullRegister = await accRegisterFunc(
                                                registerUserName,
                                                registerEmail,
                                                phoneNumber,
                                                registerPassword,
                                                registerRepetedPassword,
                                                description,
                                                sport,
                                                accountPrice,
                                                accountType,
                                                userBirthDate,
                                                locationLat,
                                                locationLon
                                            )

                                            if (succesfullRegister) {
                                                router.push('/account')
                                            }
                                        }}
                                    >
                                        <h1 className="self-center text-white text-lg">SignUp!</h1>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex w-full self-center  mt-4 h-full flex-col ">
                                <div className="flex flex-col w-[85%] self-center mt-5  ">
                                    <h1 className="h1-sm text-white">Phone Number</h1>
                                    <PhoneInput defaultCountry="ro" value={phoneNumber} onChange={phone => setPhoneNumber(phone)} className="mt-2 " />
                                </div>
                                <div className="flex flex-col w-[85%] self-center mt-1 h-24 ">
                                    <h1 className="text-white mt-4">Password</h1>
                                    <input
                                        className="text-white bg-[#474084] h-[6vh] mt-2 indent-3 rounded-xl"
                                        placeholder="Password..."
                                        value={registerPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col w-[85%] self-center mt-1 h-24 ">
                                    <h1 className="text-white mt-4">Repeat Password</h1>
                                    <input
                                        className="text-white bg-[#474084] h-[6vh] mt-2 indent-3 rounded-xl"
                                        placeholder="Password..."
                                        value={registerRepetedPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterRepeatedPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="mt-auto self-center w-full flex flex-col ">
                                    <button className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-4 mt-auto  justify-center rounded-xl" onClick={() => setComponentToShow('secondTab')}>
                                        <h1 className="self-center text-white text-lg">Go Back</h1>
                                    </button>
                                    <button
                                        className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-2 mt-auto  justify-center rounded-xl"
                                        onClick={async e => {
                                            e.preventDefault()
                                            const succesfullRegister = await accRegisterFunc(
                                                registerUserName,
                                                registerEmail,
                                                phoneNumber,
                                                registerPassword,
                                                registerRepetedPassword,
                                                description,
                                                sport,
                                                accountPrice,
                                                accountType,
                                                userBirthDate,
                                                locationLat,
                                                locationLon
                                            )

                                            if (succesfullRegister) {
                                                router.push('/account')
                                            }
                                        }}
                                    >
                                        <h1 className="self-center text-white text-lg">SignUp!</h1>
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                )
            default:
                return null
        }
    }

    return (
        <div className="flex justify-center flex-col h-[90%]">
            {!registerForm ? (
                <div className="flex flex-col w-[40%] h-[80vh] self-center bg-[#0000004d] rounded-3xl">
                    <form
                        className="flex w-[100%] h-[100%] flex-col items-center"
                        onSubmit={async e => {
                            e.preventDefault()
                            const succesfullLogin = await accLoginFunc(loginEmail, loginPassword)
                            if (succesfullLogin) {
                                router.push('/account')
                            }
                        }}
                    >
                        <h1 className="text-white text-[1.2rem] mt-8">Log Into Account</h1>
                        <div className="flex items-center justify-center h-[60%] w-[100%] flex-col">
                            <div className="flex flex-col self-center w-[85%] mt-[1.5rem]">
                                <h1 className="text-white">Email</h1>
                                <input
                                    className=" h1-[#ffffff] mt-[1vh] bg-[#474084] h-[6vh] border-none rounded-xl w-full placeholder:text-white indent-3 text-white"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setLoginEmail(e.target.value)
                                    }}
                                    value={loginEmail}
                                    type="email"
                                    placeholder="Email..."
                                />
                            </div>
                            <div className="flex flex-col self-center w-[85%] mt-[2rem]">
                                <h1 className="text-white">Password</h1>
                                <input
                                    className=" h1-[#ffffff] mt-[1vh] text-white bg-[#474084] h-[6vh] rounded-xl border-none w-full placeholder:text-white indent-3"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setLoginPassword(e.target.value)
                                    }}
                                    value={loginPassword}
                                    type="password"
                                    placeholder="Password..."
                                />
                            </div>
                        </div>
                        <button
                            className="self-center w-[85%] h-12 bg-[#474084] active:bg-[#3b366c] mb-2 mt-auto  justify-center rounded-xl"
                            onClick={async e => {
                                e.preventDefault()
                                const succesfullLogin = await accLoginFunc(loginEmail, loginPassword)
                                if (succesfullLogin) {
                                    router.replace('/account')
                                }
                            }}
                        >
                            <h1 className="self-center text-white text-lg">Log Into Account!</h1>
                        </button>
                        <div className="flex flex-col mt-auto w-full mb-4">
                            <div className="bg-white w-[100%] h-[.1rem] mb-2" />
                            <button>
                                <h1
                                    className="text-[#9c9c9c]"
                                    onClick={() => {
                                        setRegisterForm(true)
                                    }}
                                >
                                    Don' t Have An Account?
                                </h1>
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col w-[40%] h-[80vh] self-center bg-[#0000004d] rounded-3xl">
                    <div className="flex w-[100%] h-[100%] flex-col items-center">
                        <h1 className="text-white text-[1.5rem] mt-[2rem]">Create Account</h1>
                        <h1 className="text-white text-[0.7rem] mt-2">SignIn and find a new partener/Trainer</h1>
                        <div className="flex items-center h-[70%] w-[100%] flex-col">{renderComponent()}</div>
                        <div className="flex flex-col mt-auto w-full mb-4">
                            <div className="bg-white w-[100%] h-[.1rem] mb-2" />
                            <button>
                                <h1
                                    className="text-[#9c9c9c]"
                                    onClick={() => {
                                        setRegisterForm(false)
                                    }}
                                >
                                    Already have an account. LogIn?
                                </h1>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
