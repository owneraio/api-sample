const requestp = require('request-promise-native');

const docRequest = ({type, url, body}) => new Promise((resolve, reject) => {
    requestp[type]({url, body, json: true }).then((response) => {
        console.log('doc response: ', response);
        resolve(response);
    }).catch((error) => {
        console.log('doc statusCode: ', error.statusCode);
        console.log('doc error: ', error.message);
        reject(error)
    })
});

exports.docRequest = docRequest;