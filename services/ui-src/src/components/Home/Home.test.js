module.exports = {
  "Test 1 Go to google": function (client) {
    client.url("https://www.google.com").assert.visible("body").end();
  }
};
