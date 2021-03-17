import React, { useEffect, useState } from "react"
import { API } from "aws-amplify"
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import Todo from "./todo";


export default function Home() {

  const [authState, setAuthState] = React.useState<AuthState>();
  const [user, setUser] = React.useState<any>();

  React.useEffect(() => {
      onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          setUser(authData)
      });
  }, []);

  return (
    <div>
        {authState === AuthState.SignedIn && user ? (
          <div>
            <Todo/>
            <br/>
            <AmplifySignOut/>
          </div>
        ): (
          <AmplifyAuthenticator/>
        )}
    </div>
  )
}
