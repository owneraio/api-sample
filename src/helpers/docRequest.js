const requestp = require('request-promise-native');

const docRequest = ({type, url, formData}) => new Promise((resolve, reject) => {
    requestp[type]({url, formData}).then((response) => {
        console.log('doc response: ', response);
        resolve(response);
    }).catch((error) => {
        console.log('doc statusCode: ', error.statusCode);
        console.log('doc error: ', error.message);
        reject(error)
    })
});

exports.docRequest = docRequest;