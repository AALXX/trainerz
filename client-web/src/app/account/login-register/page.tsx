'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { accLoginFunc, accRegisterFunc } from '@/Auth-Security/Auth'
import BirthDateSelectorComponent from '@/Components/CommonUi/BirthDatePicker'
import OptionPicker from '@/Components/CommonUi/OptionPicker'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

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
                    <form className="mt-4 flex h-full w-full flex-grow-0 flex-col">
                        <div className="flex h-24 w-[85%] flex-col self-center">
                            <h1 className="h1-sm text-white">UserName</h1>
                            <input
                                className="mt-3 h-[6vh] rounded-xl bg-[#474084] indent-3 text-white"
                                placeholder="UserName..."
                                type="text"
                                value={registerUserName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setRegisterUserName(e.target.value)
                                }}
                            />
                        </div>
                        <div className="mt-4 flex h-24 w-[85%] flex-col self-center">
                            <h1 className="h1-sm text-white">Email</h1>
                            <input
                                className="mt-3 h-[6vh] rounded-xl bg-[#474084] indent-3 text-white"
                                placeholder="Email..."
                                value={registerEmail}
                                autoCapitalize="none"
                                type="email"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setRegisterEmail(e.target.value)
                                }}
                            />
                        </div>
                        <div className="h-26 mt-4 flex w-[85%] flex-col self-center">
                            <h1 className="h1-sm text-white">What's your birth date?</h1>
                            <BirthDateSelectorComponent onDateChange={setUserBirthDate} />
                        </div>
                        <div className="mt-7 flex h-24 w-[85%] flex-col self-center">
                            <h1 className="h1-sm text-white">Register as</h1>
                            <OptionPicker label="Account Type" options={['Trainer', 'SportsPerson']} value={accountType} onChange={value => setAccountType(value)} />
                        </div>
                        <button className="mb-2 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={() => setComponentToShow('secondTab')}>
                            <h1 className="self-center text-lg text-white">Next</h1>
                        </button>
                    </form>
                )
            case 'secondTab':
                return (
                    <form className="flex h-full w-full flex-col">
                        <div className="mt-4 flex h-36 w-[85%] flex-col self-center">
                            <h1 className="h1-sm text-white">Tell us about you</h1>
                            <textarea
                                className="mt-2 resize-none rounded-xl bg-[#474084] text-white"
                                placeholder="Description"
                                maxLength={100}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    setDescription(e.target.value)
                                }}
                                rows={20}
                                value={description}
                            />
                        </div>
                        <div className="mt-4 flex h-24 w-[85%] flex-col self-center">
                            <h1 className="h1-sm text-white">I train / i want to learn sport</h1>
                            <OptionPicker
                                label="Select Sport"
                                options={['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Rugby', 'Ice Hockey', 'Athletics (Track and Field):', 'Swimming', 'Powerlifting', 'Bodybuilding', 'Other']}
                                value={sport}
                                onChange={value => setSport(value)}
                            />
                        </div>

                        <div className="mt-auto flex w-full flex-col self-center">
                            <button className="mb-4 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={() => setComponentToShow('firstTab')}>
                                <h1 className="self-center text-lg text-white">Go Back</h1>
                            </button>
                            <button className="mb-2 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={() => setComponentToShow('thirdTab')}>
                                <h1 className="self-center text-lg text-white">Next</h1>
                            </button>
                        </div>
                    </form>
                )
            case 'thirdTab':
                return (
                    <form className="flex h-full w-full flex-col">
                        {accountType === 'Trainer' ? (
                            <div className="mt-4 flex h-full w-full flex-col self-center">
                                <div className="mt-5 flex w-[85%] flex-col self-center">
                                    <h1 className="h1-sm text-white">Phone Number</h1>
                                    <PhoneInput defaultCountry="ro" value={phoneNumber} onChange={phone => setPhoneNumber(phone)} className="mt-2" />
                                </div>
                                <div className="mt-1 flex h-24 w-[85%] flex-col self-center">
                                    <h1 className="mt-4 text-white">Password</h1>
                                    <input
                                        className="mt-2 h-[6vh] rounded-xl bg-[#474084] indent-3 text-white"
                                        placeholder="Password..."
                                        value={registerPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="mt-1 flex h-24 w-[85%] flex-col self-center">
                                    <h1 className="mt-4 text-white">Repeat Password</h1>
                                    <input
                                        className="mt-2 h-[6vh] rounded-xl bg-[#474084] indent-3 text-white"
                                        placeholder="Password..."
                                        value={registerRepetedPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterRepeatedPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="mt-auto flex w-full flex-col self-center">
                                    <button className="mb-4 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={() => setComponentToShow('secondTab')}>
                                        <h1 className="self-center text-lg text-white">Go Back</h1>
                                    </button>
                                    <button
                                        className="mb-2 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]"
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
                                        <h1 className="self-center text-lg text-white">SignUp!</h1>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 flex h-full w-full flex-col self-center">
                                <div className="mt-5 flex w-[85%] flex-col self-center">
                                    <h1 className="h1-sm text-white">Phone Number</h1>
                                    <PhoneInput defaultCountry="ro" value={phoneNumber} onChange={phone => setPhoneNumber(phone)} className="mt-2" />
                                </div>
                                <div className="mt-1 flex h-24 w-[85%] flex-col self-center">
                                    <h1 className="mt-4 text-white">Password</h1>
                                    <input
                                        className="mt-2 h-[6vh] rounded-xl bg-[#474084] indent-3 text-white"
                                        placeholder="Password..."
                                        value={registerPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="mt-1 flex h-24 w-[85%] flex-col self-center">
                                    <h1 className="mt-4 text-white">Repeat Password</h1>
                                    <input
                                        className="mt-2 h-[6vh] rounded-xl bg-[#474084] indent-3 text-white"
                                        placeholder="Password..."
                                        value={registerRepetedPassword}
                                        type="password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setRegisterRepeatedPassword(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="mt-auto flex w-full flex-col self-center">
                                    <button className="mb-4 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]" onClick={() => setComponentToShow('secondTab')}>
                                        <h1 className="self-center text-lg text-white">Go Back</h1>
                                    </button>
                                    <button
                                        className="mb-2 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]"
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
                                        <h1 className="self-center text-lg text-white">SignUp!</h1>
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
        <div className="flex h-full flex-col justify-center">
            {!registerForm ? (
                <div className="flex h-[80vh] w-[40%] flex-col self-center rounded-3xl bg-[#0000004d] shadow-xl">
                    <form
                        className="flex h-[100%] w-[100%] flex-col items-center"
                        onSubmit={async e => {
                            e.preventDefault()
                            const succesfullLogin = await accLoginFunc(loginEmail, loginPassword)
                            if (succesfullLogin) {
                                router.push('/account')
                            }
                        }}
                    >
                        <h1 className="mt-8 text-[1.2rem] text-white">Log Into Account</h1>
                        <div className="flex h-[60%] w-[100%] flex-col items-center justify-center">
                            <div className="mt-[1.5rem] flex w-[85%] flex-col self-center">
                                <h1 className="text-white">Email</h1>
                                <input
                                    className="h1-[#ffffff] mt-[1vh] h-[6vh] w-full rounded-xl border-none bg-[#474084] indent-3 text-white placeholder:text-white"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setLoginEmail(e.target.value)
                                    }}
                                    value={loginEmail}
                                    type="email"
                                    placeholder="Email..."
                                />
                            </div>
                            <div className="mt-[2rem] flex w-[85%] flex-col self-center">
                                <h1 className="text-white">Password</h1>
                                <input
                                    className="h1-[#ffffff] mt-[1vh] h-[6vh] w-full rounded-xl border-none bg-[#474084] indent-3 text-white placeholder:text-white"
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
                            className="mb-2 mt-auto h-12 w-[85%] justify-center self-center rounded-xl bg-[#474084] active:bg-[#3b366c]"
                            onClick={async e => {
                                e.preventDefault()
                                const succesfullLogin = await accLoginFunc(loginEmail, loginPassword)
                                if (succesfullLogin) {
                                    router.replace('/account')
                                }
                            }}
                        >
                            <h1 className="self-center text-lg text-white">Log Into Account!</h1>
                        </button>
                        <div className="mb-4 mt-auto flex w-full flex-col">
                            <div className="mb-2 h-[.1rem] w-[100%] bg-white" />
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
                <div className="flex h-[80vh] w-[40%] flex-col self-center rounded-3xl bg-[#0000004d] shadow-xl">
                    <div className="flex h-[100%] w-[100%] flex-col items-center">
                        <h1 className="mt-[2rem] text-[1.5rem] text-white">Create Account</h1>
                        <h1 className="mt-2 text-[0.7rem] text-white">SignIn and find a new partener/Trainer</h1>
                        <div className="flex h-[70%] w-[100%] flex-col items-center">{renderComponent()}</div>
                        <div className="mb-4 mt-auto flex w-full flex-col">
                            <div className="mb-2 h-[.1rem] w-[100%] bg-white" />
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
