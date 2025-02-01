import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Define the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks authentication status
  const [apicall,setApiCall] = useState(false)
  const [raiseInoice,setRaiseInvoice] = useState(true)
  const [takingBreak, setTakingBreak] = useState(false)


  return (
    <AuthContext.Provider value={{isAuthenticated, setIsAuthenticated,apicall,setApiCall,raiseInoice,setRaiseInvoice ,takingBreak, setTakingBreak}}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
