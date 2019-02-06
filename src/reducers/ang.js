import {
  ADD_ANG_TO_CACHE,
  UPDATE_CURRENT_ANG,
} from '../actions/ang';
// Config
import sources from '../app/sources';

const defaultCurrentAngState = {
  ang: 1,
  source: 'G',
};
Object.keys(sources).forEach((source) => {
  defaultCurrentAngState[source] = 1;
});

export const currentAng = (state = defaultCurrentAngState, action) => {
  switch (action.type) {
    case UPDATE_CURRENT_ANG:
      return {
        ...state,
        ang: action.ang,
        source: action.source,
        [action.source]: action.ang,
      };
    default:
      return state;
  }
};

const defaultAngCacheState = {};
Object.keys(sources).forEach((source) => {
  defaultAngCacheState[source] = {};
});
export const angCache = (state = defaultAngCacheState, action) => {
  switch (action.type) {
    case ADD_ANG_TO_CACHE:
      return {
        ...state,
        [action.source]: {
          ...state[action.source],
          [action.ang]: action.verses,
        },
      };
    default:
      return state;
  }
};