import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useContext } from "react";
import { UserContext } from "./App";
import { scopes } from "./Config";

export const AuthButton = () => {
  const { loading } = useContext(UserContext)
  const { instance } = useMsal({
    scopes: scopes
  });

  const isAuthenticated = useIsAuthenticated();

  return <div className="text-center mt-4">
    {isAuthenticated ? (
      <>
        {loading && 
          <div className="mx-auto mb-12 text-3xl text-center">Refreshing data...</div>
        }
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => instance.logout()}>Sign Out</button>
      </>
    ) : (
      <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => instance.loginPopup()}>Sign In</button>
    )}
  </div>
};