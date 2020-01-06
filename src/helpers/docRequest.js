const requestp = require('request-promise-native');

const docRequest = ({type, formData, url}) => new Promise((resolve) => {
    requestp[type]({url, formData}).then((response) => {
        console.log("doc response: ", response);
        resolve(JSON.parse(response));
    }).catch((error) => {
        console.log("doc statusCode: ", error.statusCode);
        console.log("doc error: ", error.message);
        resolve(error)
    })
});

exports.docRequest = docRequest;