import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define the state interface
interface AccountState {
    accountType: 'Trainer' | 'Sportsperson' | null
}

// Define the initial state
const initialState: AccountState = {
    accountType: null // or you can default it to a specific type like 'Trainer'
}

// Create the slice
export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setAccountType: (state, action: PayloadAction<'Trainer' | 'Sportsperson'>) => {
            state.accountType = action.payload
        },
        initializeAccountType: (state, action: PayloadAction<'Trainer' | 'Sportsperson' | null>) => {
            state.accountType = action.payload
        }
    }
})

// Export the actions
export const { setAccountType, initializeAccountType } = accountSlice.actions

// Export the reducer
export default accountSlice.reducer
