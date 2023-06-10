import React, { useState, createContext, useEffect } from "react";

const CurrentUserContext = createContext(null);

const Store = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
        {children}
    </CurrentUserContext.Provider>
  );
};
export default Store;
export { CurrentUserContext };
