import { combineReducers } from 'redux';
import { loader, user } from '@reducer/common';
import { categories } from '@reducer/category';
import { alert } from '@reducer/alert';
import { services } from "@reducer/service";
import { curations } from "@reducer/curation";
import { booking } from "@reducer/booking";

const rootReducer = combineReducers({
  categories,
  services,
  curations,
  booking,
  user,
  loader,
  alert
});

export default rootReducer;
