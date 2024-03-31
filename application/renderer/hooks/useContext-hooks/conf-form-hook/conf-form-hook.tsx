import {createContext} from "react";
import {confFormDefaultBehavior} from "./conf-form-hook-provider";

export const ConfFormContext = createContext(confFormDefaultBehavior);