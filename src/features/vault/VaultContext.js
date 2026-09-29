import { createContext, useContext } from "react";
export const VaultContext = createContext(null);
export const useVault = () => useContext(VaultContext);
