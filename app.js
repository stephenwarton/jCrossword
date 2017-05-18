const API_URL = 'https://galvanize-cors-proxy.herokuapp.com/http://jservice.io/api/random?count=50';
let answerArray = [];
let crossword = [];
let placedWords = [];
let selectedID ='';
let previousID = '';
let direction = 'across';

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
  } else {
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
}

function main(result){
  createAnswerArray(result);
  initialize(crossword);
  placeWords();
  console.log(placedWords);
  displayCrossword();
  //show cursor at first word
  $(selectedID).css('background-color','rgb(179, 240, 247)');
  displayClues();
}

function placeWords(){
  let index = [];
  for(let i=0;i<answerArray.length;i++){
    if(placedWords.length === 0 && answerArray[i].word.length <= 15){
      placeFirst(answerArray[i]);
    } else {
        index = getIndexOfMatch(answerArray[i]);
        //try to place at intersection
        if(index.length !== 0 && index[2] === 'across'){
          placeDown(answerArray[i],index[1], index[0]);
        } else if(index.length !== 0 && index[2] === 'down'){
          placeAcross(answerArray[i],index[1],index[0]);
        }
    }
  }
}

function placeFirst(clueAnswerObject){
  let word = clueAnswerObject.word;
  //don't place word too low
  let y = Math.floor(Math.random() * 9);
  for(let i=0; i<word.length;i++){
    crossword[y][i] = word.charAt(i);
  }
  clueAnswerObject.startPosition = [y,0];
  clueAnswerObject.direction = 'across';
  placedWords.push(clueAnswerObject);
  //focus first word
  selectedID = `#${y}-0`;
  previousID = selectedID;
}

function getIndexOfMatch(clueAnswerObject){
  let word = clueAnswerObject.word;
  let index = [];
  for(let i=0; i<word.length; i++){
    let char = word.charAt(i);
    for(let j=0; j<placedWords.length;j++){
      for(let k=0; k<placedWords[j].word.length;k++){
        if(char === placedWords[j].word.charAt(k)){
          let y = placedWords[j].startPosition[0];
          let x = placedWords[j].startPosition[1];
          if(placedWords[j].direction === 'across'){
            x += k;
          } else if(placedWords[j].direction === 'down'){
              y += k;
          }
          index = [y,x];
          return [index,i,placedWords[j].direction];
        }
      }
    }
  }
  return index;
}

function placeDown(clueAnswerObject, charIndex, crossIndex){
  let word = clueAnswerObject.word;
  let aboveAmount = charIndex;
  let belowAmount = word.length - charIndex;
  let y = crossIndex[0];
  let x = crossIndex[1];
  let start = y-aboveAmount;
  if(start>=0 && y+belowAmount <15 ){
    if(canBePlaced([start,x],word,'down')){
      //push to placedWords
      clueAnswerObject.direction = 'down';
      clueAnswerObject.startPosition = [start,x];
      placedWords.push(clueAnswerObject);
      //add to crossword
      for(let i=0; i<word.length;i++){
        crossword[start][x] = word.charAt(i);
        start += 1;
      }
    }
  }
}

function placeAcross(clueAnswerObject, charIndex, crossIndex){
//todo later
}

function canBePlaced(startIndex,word,direction){
  let y = startIndex[0];
  let x = startIndex[1];

  if(direction === 'down'){
    for(let i=0;i<word.length;i++){
      //check for another vertical word here
      if(crossword[y][x] !== '#' &&  crossword[y][x] !== word.charAt(i)){
        return false;

        //check to see if neighbors are occupied
      } else if(crossword[y][x] === '#'){
          if(crossword[y][x-1] !== '#' || crossword[y][1+x] !== '#'){
            return false;
          }
      }
      y++;
    }
  }
  return true;
}

function displayCrossword(){
  for(let i=0;i<15; i++) {
    let rowContainer = $('<div></div>');
    $(rowContainer).addClass(''+i);
    $(rowContainer).css('display','flex');
    $('.crossword').append(rowContainer);
    for(let j=0;j<15;j++){
      let square = $(`<div></div>`);
      $(square).attr('id',''+i+'-'+j);
      $(square).css('width', '3vw');
      $(square).css('height', '3vw');
      $(square).css('border', '1px solid black');
      $(square).css('min-width', '25px');
      $(square).css('min-height', '25px');
      if(crossword[i][j]=== '#'){
        $(square).css('background','black');
      } else {
        $(square).css('background','white');
        $(square).attr('contenteditable','true');
      }
      $('.'+i).append(square);
    }
  }
}

function displayClues(){
  let clueNumber = 1;
  for(let object of placedWords){
    let clue = $(`<p>${clueNumber}. ${object.clue}</p>`)
    let y = object.startPosition[0];
    let x = object.startPosition[1];
    if(object.direction === 'across'){
      $('.across').append(clue);
    } else if(object.direction === 'down'){
      $('.down').append(clue);
    }
    id = '#'+y+'-'+x;
    $(''+id).text(''+clueNumber);
    clueNumber++;
  }
}

$('.crossword').on("click",function(event){
  event.preventDefault();
  let backgroundColor = $(event.target).css('background-color');
  if(backgroundColor === 'rgb(255, 255, 255)'){
    $(previousID).css('background-color','white');
    selectedID = '#'+event.target.id;
    previousID = selectedID;
    $(selectedID).css('background-color','rgb(179, 240, 247)');
  }
});

$(document).on('keydown',function(event){
  event.preventDefault();
  let char = String.fromCharCode(event.keyCode);
  if(event.keyCode === 9 || event.keyCode === 32){
    direction = 'across';
    goToNext();
  }
  if(event.keyCode === 13){
    direction = 'down';
    goToNext();
  }
  if(/[a-zA-Z]/.test(char)){
    let match = $(selectedID).text().match(/[0-9]+/);
    if(match){
      $(selectedID).text(match[0]+' '+char);
    } else {
        $(selectedID).text(char);
    }
    goToNext();
  }
});

function goToNext(){
  let nextID = getNextID();
  if($(nextID).css('background-color') === 'rgb(255, 255, 255)'){
    $(previousID).css('background-color','white');
    selectedID = nextID;
    previousID = selectedID;
    $(selectedID).css('background-color','rgb(179, 240, 247)');
  }
}

function getNextID(){
  let nextID = '';
  let index = selectedID.match(/[0-9]+/g);
  let y = index[0];
  let x = index[1];
  if(direction === 'across'){
    x = parseInt(x)+1;
    nextID = `#${y}-${x}`;
  }
  if(direction === 'down'){
    y = parseInt(y)+1;
    nextID = `#${y}-${x}`;
  }
  return nextID;
}
