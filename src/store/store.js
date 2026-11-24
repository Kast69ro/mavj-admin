import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice, { logout, passwordChangeRequired } from "../features/auth/authSlice";
import operatorsSlice from "../features/operators/operatorsSlice";
import victorinaSlice from "../features/victorina/victorinaSlice";
import subscribersSlice from "../features/subscribers/subscribersSlice";
import smsSlice from "../features/SMS/sendSMSSlice";
import analyticsSlice from "../features/analytics/analyticsSlice";
import periodsSlice from "../features/poriods/periodsSlice"; 
import billingSlice from "../features/biling/bilingSlice"; 
import ussdSlice from "../features/USSD/ussdTemplatesSlice";
import operatorContentSlice from "../features/operatorContent/operatorContentSlice";
import { setPasswordChangeHandler } from "../utils/axiosInstance";


const appReducer = combineReducers({
  auth:authSlice,
  operators:operatorsSlice,
  victorina:victorinaSlice,
  subscribers:subscribersSlice,
  sms:smsSlice, 
  analytics:analyticsSlice,
  periods: periodsSlice,
  billing: billingSlice,
  ussd: ussdSlice,
  operatorContent: operatorContentSlice,
});

// При выходе сбрасываем всё: следующий пользователь в этой же вкладке не должен
// увидеть данные (операторов, абонентов, биллинг), загруженные под прежней ролью
const rootReducer = (state, action) => appReducer(logout.match(action) ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
});

// Любой ответ 403 PASSWORD_CHANGE_REQUIRED открывает экран смены пароля
setPasswordChangeHandler(() => store.dispatch(passwordChangeRequired()));
