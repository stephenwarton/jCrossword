const API_URL = 'https://galvanize-cors-proxy.herokuapp.com/http://jservice.io/api/random?count=50';
let answerArray = [];
let crossword = [];
let placedWords = [];
let selectedID ='';
let previousID = '';
let direction = 'across';
let placedWordsIndex = 0;

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
      answerObject['clue']= '<b>['+object.category.title+']</b> '+ object.question;
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
  //console.log(placedWords);
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
        $(square).css('display','flex');
        $(square).css('justify-content','center');
        $(square).css('align-items','center');
        $(square).css('font-weight','bold');
      }
      $('.'+i).append(square);
    }
  }
}

function displayClues(){
  let clueNumber = 1;
  for(let object of placedWords){
    let y = object.startPosition[0];
    let x = object.startPosition[1];
    let clue = $(`<p>${clueNumber}. ${object.clue}</p><p><button type="button" class="btn btn-default reveal solve-${y}-${x}">Reveal Word for Clue ${clueNumber}</button></p`);
    if(object.direction === 'across'){
      $('.across').append(clue);
    } else if(object.direction === 'down'){
      $('.down').append(clue);
    }
    //add clue number to crossword puzzle
    id = '#'+y+'-'+x;
    $(''+id).append('<sup>'+clueNumber+'</sup>');
    clueNumber++;
  }
}

$('.crossword').on("click",function(event){
  event.preventDefault();
  let backgroundColor = $(event.target).css('background-color');
  if(backgroundColor !== 'rgb(0, 0, 0)'){
    $(previousID).css('background-color','white');
    selectedID = '#'+event.target.id;
    previousID = selectedID;
    $(selectedID).css('background-color','rgb(179, 240, 247)');
  }
});

$('.check-answers').on("click",function(event){
  event.preventDefault();
  for(let y=0;y<15;y++){
    for(let x=0;x<15;x++){
      let id=`#${y}-${x}`;
      if(crossword[y][x] !== '#'){
        if(isEqual(y,x,id)){
          $(id).css('background-color','#dff0d8');
        } else {
            $(id).css('background-color','#f2dede');
        }
      }
    }
  }
});

function isEqual(y,x,id){
  let match = $(id).text().match(/[A-Z]/);
  if(match){
    if(match[0] === crossword[y][x]){
      return true;
    }
  }
  return false;
}

$('.solve-box').on("click",function(event){
  event.preventDefault();
  let index = selectedID.match(/[0-9]+/g);
  let y = index[0];
  let x = index[1];
  let match = $(selectedID).text().match(/[0-9]+/);
  if(match){
    $(selectedID).text('');
    $(selectedID).append('<sup>'+match[0]+'</sup>'+' '+crossword[y][x]);
  } else {
      $(selectedID).text(crossword[y][x]);
  }
});

$('.solve-puzzle').on("click",function(event){
  event.preventDefault();
  for(let y=0;y<15;y++){
    for(let x=0;x<15;x++){
      let id=`#${y}-${x}`;
      if(crossword[y][x] !== '#'){
        let match = $(id).text().match(/[0-9]+/);
        if(match){
          $(id).text('');
          $(id).append('<sup>'+match[0]+'</sup>'+' '+crossword[y][x]);
        } else {
            $(id).text(crossword[y][x]);
        }
      }
    }
  }
});

$('p').on("click", '.reveal', function(){
  let buttonText = $(this).text();
  let clueNumber = buttonText.charAt(buttonText.length-1);
  let wordObject = placedWords[parseInt(clueNumber)-1];
  let word = wordObject.word;
  let y=wordObject.startPosition[0];
  let x=wordObject.startPosition[1];
  let id = `#${y}-${x}`;
  let wordDirection = wordObject.direction;

  for(let i=0; i<word.length; i++){
    id = `#${y}-${x}`;
    let match = $(id).text().match(/[0-9]+/);
    if(match){
      $(id).text('');
      $(id).append('<sup>'+match[0]+'</sup>'+' '+crossword[y][x]);
    } else {
        $(id).text(crossword[y][x]);
    }
    if(wordDirection === 'across'){
      x++;
    } else if(wordDirection === 'down'){
      y++;
    }
  }
});

$(document).on('keydown',function(event){
  event.preventDefault();
  let char = String.fromCharCode(event.keyCode);
  //space, right arrow
  if(event.keyCode === 32 || event.keyCode === 39){
    direction = 'across';
    goToNext();
  }
  //enter, down arrow
  if(event.keyCode === 13 || event.keyCode === 40){
    direction = 'down';
    goToNext();
  }
  //left arrow
  if(event.keyCode === 37){
    direction = 'back';
    goToNext();
    direction = 'across';
  }
  //up arrow
  if(event.keyCode === 38){
    direction = 'up';
    goToNext();
    direction = 'down';
  }
  //tab - cycle through start positions
  if(event.keyCode === 9){
    if(placedWordsIndex >= placedWords.length){
      placedWordsIndex = 0;
    }
    let y=placedWords[placedWordsIndex].startPosition[0];
    let x=placedWords[placedWordsIndex].startPosition[1];
    direction = placedWords[placedWordsIndex].direction;
    $(previousID).css('background-color','white');
    selectedID = `#${y}-${x}`;
    previousID = selectedID;
    $(selectedID).css('background-color','rgb(179, 240, 247)');
    placedWordsIndex++;
  }
  //backspace/delete
  if(event.keyCode === 8){
    //erase current letter if needed
    let match = $(selectedID).text().match(/[0-9]+/);
    if(match){
      $(selectedID).text('');
      $(selectedID).append('<sup>'+match[0]+'</sup>');
    } else {
        $(selectedID).text('');
    }
    //go back or up a space
    if(direction === 'across'){
      direction = 'back';
      goToNext();
      direction = 'across';
    } else if (direction === 'down'){
      direction = 'up';
      goToNext();
      direction = 'down';
    }
  }
  //any letter key
  if(/[a-zA-Z]/.test(char)){
    let match = $(selectedID).text().match(/[0-9]+/);
    if(match){
      $(selectedID).text('');
      $(selectedID).append('<sup>'+match[0]+'</sup>'+' '+char);
    } else {
        $(selectedID).text(char);
    }
    goToNext();
  }
});

function goToNext(){
  let nextID = getNextID();
  if(nextID && $(nextID).css('background-color') !== 'rgb(0, 0, 0)'){
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
  } else if(direction === 'down'){
    y = parseInt(y)+1;
  } else if(direction === 'back'){
    x = parseInt(x)-1;
  } else if(direction === 'up'){
    y = parseInt(y)-1;
  }
  if(y <0 || x< 0){
    return false;
  }

  nextID = `#${y}-${x}`;
  return nextID;
}
