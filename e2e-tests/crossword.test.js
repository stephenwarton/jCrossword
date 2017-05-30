module.exports = {
  'Index test' : function (browser) {
    browser
      .url('http://localhost:8080/crossword.html')
      .waitForElementVisible('body', 1000)
      .end();
  }
};
