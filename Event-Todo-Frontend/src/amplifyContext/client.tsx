 import React, {ReactNode} from 'react'
import awsmobile from "../aws-exports";
import {Amplify} from 'aws-amplify';

type props = {
    children: ReactNode
}

export default function  amplifyClient({children}:props) {
    Amplify.configure(awsmobile)

    return <div>{children}</div>
}