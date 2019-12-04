const axios = require('axios');

const handleErrors = (error) => {
    if (error.response) {
        const response = error.response;
        console.log(response.data);
        console.log(response.status);
        console.log(response.headers);
    } else if (error.request) {
        console.log(error.request);
    } else {
        console.log('Error', error.message);
    }
};

const restRequest = ({type, data, url}) => new Promise((resolve) => {
    axios[type](url, data).then(({status, data}) => {
        status && console.log("STATUS=" + status);
        data && console.log("data=" + JSON.stringify(data));
        resolve(data);
    }).catch(handleErrors)
});

exports.restRequest = restRequest;