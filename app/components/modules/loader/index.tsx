import React from 'react'
import { useSelector } from 'react-redux';

function Loader() {
    const loading = useSelector((state: any) => state.loader);
    return (
        <>
            {loading ? <div className="loaderbody">
                <div className="spinner">
                    <img className="fullwidth" src="/assets/img/loading.svg" />
                </div>
            </div> : null}
        </>
    )
}

export default Loader
