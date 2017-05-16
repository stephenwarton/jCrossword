const API_URL = 'https://galvanize-cors-proxy.herokuapp.com/http://jservice.io/api/random?count=100';
let answerArray = [];
let crossword = [];
let placedWords = [];

$(appReady);

function appReady(){
  $.get(API_URL)
    .then(main);
}

function createAnswerArray(result){
  for(let object of result){
    let answerObject = {};
    let cleanedAnswer = cleanAnswer(object.answer);
    if(cleanedAnswer && object.question !== ''){
      answerObject['word']= cleanedAnswer;
      answerObject['clue']= object.question + ' (' + object.category.title + ')';
      answerArray.push(answerObject);
    }
  }
  answerArray.sort(function(a,b){
    return b.word.length-a.word.length;
  });
  console.log(answerArray);
}

function cleanAnswer(answerString){
  let newAnswer = answerString.toUpperCase();
  if(/^[A-Z]+$/.test(newAnswer)){
    return newAnswer;
  } else if(/^THE\s/.test(newAnswer)){
    return cleanAnswer(newAnswer.slice(4, newAnswer.length));
  } else if(/^A\s/.test(newAnswer)){
    return cleanAnswer(newAnswer.slice(2, newAnswer.length));
  } else if(/^<I>/.test(newAnswer)){
    return cleanAnswer(newAnswer.slice(3, newAnswer.length-4));
  }
  else {
    return '';
  }
}

function initialize(crossword){
  for(let y=0;y<15;y++){
    let array = [];
    for(let x=0;x<15;x++){
      array.push('#');
    }
  crossword.push(array);
  }
  console.log(crossword);
}

function main(result){
  createAnswerArray(result);
  initialize(crossword);
  placeWords();
  console.log(placedWords);
  console.log(crossword);
}

function placeWords(){
  for(let i=0;i<answerArray.length;i++){
    if(placedWords.length === 0 && answerArray[i].word.length <= 15){
      placeFirst(answerArray[i]);
    } else {
      //check shared characters
      //try to place at intersection
      console.log('place other word');
    }
  }
}

function placeFirst(clueAnswerObject){
  let word = clueAnswerObject.word;
  let y = Math.floor(Math.random() * 14);
  for(let i=0; i<word.length;i++){
    crossword[y][i] = word.charAt(i);
  }
  clueAnswerObject.startPosition = [y,0];
  clueAnswerObject.direction = 'across';
  placedWords.push(clueAnswerObject);
}
