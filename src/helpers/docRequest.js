const requestp = require('request-promise-native');

const docRequest = ({type, formData, url}) => new Promise((resolve) => {
    requestp[type]({url, formData}).then((response) => {
        console.log(response);
        resolve(JSON.parse(response));
    }).catch((error) => {
        console.log(error.statusCode);
        console.log(error.message);
        resolve(error)
    })
});

exports.docRequest = docRequest;