jest.mock('../../src/helpers/configuration', () => {
    return {
        SERVER_BASE_URI: 'http://localhost:3000' //'https://api.ownera.io'
    };
});