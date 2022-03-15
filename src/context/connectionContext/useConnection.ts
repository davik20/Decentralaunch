import React, { createContext, useContext} from 'react'
import {ConnectionContextType} from "./types";



export const connectionContext = createContext<ConnectionContextType>({account: null, connectWallet:null, disconnectWallet: null})

function useConnection(){
    const context = useContext(connectionContext)
    if(!context) throw new Error("You cannot use useConnection outside of a react component")

    return (context);


}

export default useConnection
