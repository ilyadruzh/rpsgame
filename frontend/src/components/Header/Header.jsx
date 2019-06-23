import React, {Component} from 'react';
import StartGame from "../MainBody/modals/StartGame";

export default class Header extends Component {


    render() {
        return (
            <header>
                <div className="bg-dark" id="navbarHeader"></div>

                <div className="navbar navbar-dark bg-dark shadow-sm">
                    <div className="container d-flex justify-content-between">
                        <a href="#" className="navbar-brand d-flex align-items-center">
                            <strong>Rock–paper–scissors</strong>
                        </a>

                    </div>
                </div>
            </header>

        );
    }
}
