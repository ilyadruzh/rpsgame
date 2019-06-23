import React, { Component } from 'react'

class NotFound extends Component {

    render() {
        return (
            <div className="container  mt-md-5">
                <div className="row text-left">
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-6">
                        <h1>404: Page not found</h1>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
                <div className="row text-left">
                </div>
                <div className="row text-left">
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-6">
                        <p>Unfortunately, this page does not exist.</p>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
            </div>
        )
    }
}

export default NotFound;