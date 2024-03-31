import { createContext } from "react";
import { varFormDefaultBehavior } from "./variance-form-hook-provider";

export const VarianceFormContext = createContext(varFormDefaultBehavior);
