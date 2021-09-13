import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { OraclePrice } from '@helium/http'
import { Onboarding } from '@helium/react-native-sdk'
import {
  getBlockHeight,
  getCurrentOraclePrice,
  getPredictedOraclePrice,
} from '../../utils/appDataClient'

export type HeliumDataState = {
  blockHeight?: number
  currentOraclePrice?: OraclePrice
  predictedOraclePrices: OraclePrice[]
  makers?: Onboarding.Maker[]
  hotspotCount?: number
}
const initialState: HeliumDataState = {
  predictedOraclePrices: [],
}

export const fetchBlockHeight = createAsyncThunk<number>(
  'heliumData/blockHeight',
  async () => getBlockHeight(),
)

export const fetchCurrentOraclePrice = createAsyncThunk<OraclePrice>(
  'heliumData/currentOraclePrice',
  async () => getCurrentOraclePrice(),
)

export const fetchPredictedOraclePrice = createAsyncThunk<OraclePrice[]>(
  'heliumData/predictedOraclePrice',
  async () => getPredictedOraclePrice(),
)

export const fetchInitialData = createAsyncThunk<HeliumDataState>(
  'heliumData/fetchInitialData',
  async () => {
    const vals = await Promise.all([
      getCurrentOraclePrice(),
      getPredictedOraclePrice(),
      Onboarding.getMakers(),
      getBlockHeight(),
    ])
    const [
      currentOraclePrice,
      predictedOraclePrices,
      makers,
      blockHeight,
    ] = vals
    return {
      currentOraclePrice,
      predictedOraclePrices,
      makers,
      blockHeight,
    }
  },
)

// This slice contains global helium data not specifically related to the current user
const heliumDataSlice = createSlice({
  name: 'heliumData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchInitialData.fulfilled, (state, { payload }) => {
      state.currentOraclePrice = payload.currentOraclePrice
      state.predictedOraclePrices = payload.predictedOraclePrices
      state.makers = payload.makers
      state.blockHeight = payload.blockHeight
    })
    builder.addCase(fetchBlockHeight.fulfilled, (state, { payload }) => {
      // this is happening on an interval, only update if there's a change
      if (state.blockHeight !== payload) {
        state.blockHeight = payload
      }
    })
    builder.addCase(fetchCurrentOraclePrice.fulfilled, (state, { payload }) => {
      state.currentOraclePrice = payload
    })
    builder.addCase(
      fetchPredictedOraclePrice.fulfilled,
      (state, { payload }) => {
        state.predictedOraclePrices = payload
      },
    )
  },
})

export default heliumDataSlice
