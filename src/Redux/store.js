import { configureStore } from '@reduxjs/toolkit'
import crmSlice from './features/crmSlice.js'

export const store = configureStore({
    reducer: {
        crmUser: crmSlice
    },
})