import React, {Component} from 'react'

export default class Forbidden extends Component {

    componentDidMount() {
        document.title = "????";
    }

    render() {
        return (
            <div className="container  mt-md-5">
                <div className="row text-left">
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-6">
                        <h1>Доступ закрыт.</h1>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
                <div className="row text-left">
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-6">
                        <h1>(403-ая ошибка)</h1>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
                <div className="row text-left">
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-6">
                        <p>К сожалению, у вас не достаточно прав для просмотра данной страницы(выполнения данной
                            операции).</p>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
            </div>
        )
    }
}