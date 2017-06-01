module.exports = {
  'Index test' : function (browser) {
    browser.url('http://localhost:8080/crossword.html');
    browser.waitForElementVisible('.crossword', 10000,function(){
      browser.pause(10000);
      for(let i=0;i<15;i++){
        for(let j=0;j<15;j++){
          browser.expect.element(`#${i}-${j}`).to.be.present;
        }
      }
    });
  browser.end();
  }
};
