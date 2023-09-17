
process.env.NODE_ENV = 'test';

const config = require('config');

test('Server config exist', () => {
    expect(config.has("server")).toBe(true);
});
test('Default config exist', () => {
    expect(config.has("server.port")).toBe(true);
    expect(config.has("server.protocol")).toBe(true);
});