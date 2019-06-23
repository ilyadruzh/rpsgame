import React from 'react'
import './ErrorHandler.css'

export const ErrorHandler = ({props}) => {

    return (
        <div className="container mt-md-3 mb-md-3">
            <div className="mt-md-2 mb-md-2 text-center">
                <span className="label errormsg">
                    {props}
                </span>
            </div>
        </div>
    )
};