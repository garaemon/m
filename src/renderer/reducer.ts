import { reducerWithInitialState } from "typescript-fsa-reducers";

import { IAppConfig } from "../IAppConfig";

export interface State extends IAppConfig {}

export const initialState: State = {
  foldImage: false,
  foldLink: false,
  foldMath: false,
  foldEmoji: false,
  showLineNumber: false,
};

export const Reducer = reducerWithInitialState(initialState);
