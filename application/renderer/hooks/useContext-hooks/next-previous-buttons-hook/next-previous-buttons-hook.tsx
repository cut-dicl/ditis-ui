import {createContext} from "react";
import {nextPreviousButtonDefaultBehavior} from "./next-previous-buttons-hook-provider";

export const NextPreviousButtonContext = createContext(nextPreviousButtonDefaultBehavior);