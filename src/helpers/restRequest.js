const axios = require('axios');

const handleErrors = (error, name) => {
    let errorMsg = '';
    if (error.response) {
        const {headers, status, data} = error.response;
        console.warn(`${name} status ${status} response:`, data, headers);
        if (status === 422) {
            errorMsg = data.errors.reduce((msg, err) => msg.concat(`${err.msg}, `), '')
        } else {
            errorMsg = data.error.message;
        }

    } else if (error.request) {
        console.warn(`${name} response:`, error.request);
        errorMsg = error.request;
    } else {
        console.warn(`${name} response:`, error.message);
        errorMsg = error.message;
    }

    return errorMsg
};

const restRequest = ({type, data, url}) => new Promise((resolve, reject) => {
    const name = `${type}:${url}`;
    console.log(`${name} ${type === 'get' ? '' : 'request:' + JSON.stringify(data)}`);
    axios[type](url, data).then(({status, data: response}) => {
        if (status === 200) {
            console.log(`${name} status ${status} response:`, response);
            resolve(response);
        } else {
            reject(response)
        }
    }).catch((error) => {
        const errorMsg = handleErrors(error, name);
        reject(errorMsg);
    })
});

exports.restRequest = restRequest;