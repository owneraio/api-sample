jest.mock('../../src/helpers/configuration', () => {
    return {
        SERVER_BASE_URI: 'https://api.ownera.io'
    };
});