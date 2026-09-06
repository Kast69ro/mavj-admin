import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice";
import operatorsSlice from "../features/operators/operatorsSlice";
import victorinaSlice from "../features/victorina/victorinaSlice";
import subscribersSlice from "../features/subscribers/subscribersSlice";
import smsSlice from "../features/SMS/sendSMSSlice";
import analyticsSlice from "../features/analytics/analyticsSlice";
import periodsSlice from "../features/poriods/periodsSlice"; 
import billingSlice from "../features/biling/bilingSlice"; 


export const store = configureStore({
  reducer: {
    auth:authSlice,
    operators:operatorsSlice,
    victorina:victorinaSlice,
    subscribers:subscribersSlice,
    sms:smsSlice, 
    analytics:analyticsSlice,
    periods: periodsSlice,
    billing: billingSlice,
  },
});