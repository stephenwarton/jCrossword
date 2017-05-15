const API_URL = 'https://galvanize-cors-proxy.herokuapp.com/http://jservice.io/api/random?count=10';
let answerArray = [];
$(appReady);

function appReady(){
  $.get(API_URL)
    .then(getAnswerArray);
}

function getAnswerArray(clues){
  for(let object of clues){
    let answerObject = {};
    let cleanedAnswer = cleanAnswer(object.answer);
    answerObject[cleanedAnswer] = object.question + ' (' +object.category.title + ')';
    answerArray.push(answerObject);
  }
  console.log(answerArray);
}

function cleanAnswer(answerString){
  let newAnswer = answerString.toLowerCase();
  newAnswer = newAnswer.replace(/\s+/g, '');
  return newAnswer;
}
