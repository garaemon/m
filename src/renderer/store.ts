import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {Reducer, State} from './reducer';
import thunk from 'redux-thunk';

export type RendererState = {
  state: State
};

const storeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  combineReducers<RendererState>({
    state: Reducer,
  }),
  storeEnhancers(applyMiddleware(thunk)));

export default store;
