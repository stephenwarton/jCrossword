let potentialWords = [];
let crossword = [];
let placedWords = [];
let selectedID ='';
let previousID = '';
let direction = 'across';
let placedWordsIndex = 0;

$(appReady);

function appReady(){
  const API_URL = 'https://jcrossword.herokuapp.com/api/v1/jcrossword';
  $.get(API_URL)
    .then(main);
}

function main(result){
  potentialWords = makePotentialWordList(result);
  crossword = newCrossword();
  placeWords();
  displayCrossword();
  //show cursor at first word
  $(selectedID).css('background-color','rgb(179, 240, 247)');
  displayClues();
}

function makePotentialWordList(result){
  let words = [];
  for(let object of result){
    let wordAndClue = {};
    let parsedWord = parseWord(object.answer);
    if(parsedWord.length>1 && object.question !== ''){
      wordAndClue['word']= parsedWord;
      wordAndClue['clue']= `<b>[${object.category.title}]</b> ${object.question}`;
      words.push(wordAndClue);
    }
  }
  //sort array by word length
  words.sort((a,b) => b.word.length-a.word.length);
  return words;
}

function parseWord(wordString){
  let word = wordString.toUpperCase();
  if(/^[A-Z]+$/.test(word)){
    return word;
  } else if(/^THE\s/.test(word)){
      return parseWord(word.slice(4, word.length));
  } else if(/^A\s/.test(word)){
      return parseWord(word.slice(2, word.length));
  } else if(/^<I>/.test(word)){
      return parseWord(word.slice(3, word.length-4));
  } else {
      return '';
  }
}

function newCrossword(){
  let crossword=[];
  for(let y=0;y<15;y++){
    let array = [];
    for(let x=0;x<15;x++){
      array.push('#');
    }
  crossword.push(array);
  }
  return crossword;
}

function placeWords(){
  for(let i=0;i<potentialWords.length;i++){
    let wordAndClue = potentialWords[i];
    let word = wordAndClue.word;
    if(placedWords.length === 0 && word.length <= 15){
      placeFirst(wordAndClue);
    } else {
        attemptPlacement(wordAndClue);
    }
  }
}

function attemptPlacement(wordAndClue){
  let index = [];
  let charStart = 0;
  let word = wordAndClue.word;
  let placed = false;
  while(!placed && charStart<word.length){
    index = getIndexOfMatch(wordAndClue,charStart);
    let [crossIndex, charIndex, direction] = index;
    //try to place at intersection
    if(index.length !== 0 && direction === 'across'){
      placed = placeDown(wordAndClue, charIndex, crossIndex);
    } else if(index.length !== 0 && direction === 'down'){
      placed = placeAcross(wordAndClue, charIndex, crossIndex);
    }
  charStart++;
  }
}

function placeFirst(wordAndClue){
  let word = wordAndClue.word;
  let y = Math.floor(Math.random() * 14);
  for(let i=0; i<word.length;i++){
    crossword[y][i] = word.charAt(i);
  }
  wordAndClue.startPosition = [y,0];
  wordAndClue.direction = 'across';
  placedWords.push(wordAndClue);
  //focus first word
  selectedID = `#${y}-0`;
  previousID = selectedID;
}

function getIndexOfMatch(wordAndClue,charStart){
  let index = [];
  let word = wordAndClue.word;
  for(let i=charStart; i<word.length; i++){
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
  let placed = false;
  let word = clueAnswerObject.word;
  let aboveAmount = charIndex;
  let belowAmount = word.length - charIndex - 1;
  let y = crossIndex[0];
  let x = crossIndex[1];
  let startIndex = y-aboveAmount;
  let finishIndex = y+belowAmount;
  if(startIndex>=0 && finishIndex <15 ){
    if(canBePlaced([startIndex,x],word,'down',crossIndex)){
      placed = true;
      //push to placedWords
      clueAnswerObject.direction = 'down';
      clueAnswerObject.startPosition = [startIndex,x];
      placedWords.push(clueAnswerObject);
      //add to crossword
      for(let i=0; i<word.length;i++){
        crossword[startIndex][x] = word.charAt(i);
        startIndex += 1;
      }
    }
  }
  return placed;
}

function placeAcross(clueAnswerObject, charIndex, crossIndex){
//todo later
let placed = false;
let word = clueAnswerObject.word;
let leftAmount = charIndex;
let rightAmount = word.length - charIndex - 1;
let y = crossIndex[0];
let x = crossIndex[1];
let startIndex = x-leftAmount;
let finishIndex = x+rightAmount;
if(startIndex>=0 && finishIndex <15 ){
  if(canBePlaced([y,startIndex],word,'across',crossIndex)){
    placed = true;
    //push to placedWords
    clueAnswerObject.direction = 'across';
    clueAnswerObject.startPosition = [y,startIndex];
    placedWords.push(clueAnswerObject);
    //add to crossword
    for(let i=0; i<word.length;i++){
      crossword[y][startIndex] = word.charAt(i);
      startIndex += 1;
    }
  }
}
return placed;
}

function canBePlaced(startIndex,word,direction,crossIndex){
  let [y,x] = startIndex;
  let [yCross,xCross] = crossIndex;

  if(direction === 'down'){
    if(yCross===0 && crossword[1+yCross][xCross] !== '#'){
      return false;
    } else if(yCross===14 && crossword[yCross-1][xCross] !== '#'){
        return false;
    } else if((yCross>=1 && crossword[yCross-1][xCross] !== '#')|| (yCross<14 && crossword[1+yCross][xCross] !== '#')){
         return false;
    }

    if(y>=1 && crossword[y-1][x] !== '#'){
      return false;
    } else if(word.length+y<=13 && crossword[word.length+y][x] !== '#'){
        return false;
    }

    for(let i=0;i<word.length;i++){
      //check for another horizontal word here
      if(crossword[y][x] !== '#' &&  crossword[y][x] !== word.charAt(i)){
        return false;
      }
      //check to see if neighbors are occupied
      if(crossword[y][x] === '#'){
        if((x>=1 && crossword[y][x-1] !== '#') || (x<=13 && crossword[y][1+x] !== '#')){
          return false;
        } else if((x===0 && crossword[y][1+x] !== '#') || (x===14 && crossword[y][x-1] !== '#')){
          return false;
        }
      }
      y++;
    }
  }
  else if(direction === 'across'){
    //todo later
    if(xCross===0 && crossword[yCross][1+xCross] !== '#'){
      return false;
    } else if(xCross===14 && crossword[yCross][xCross-1] !== '#'){
        return false;
    } else if((xCross>=1 && crossword[yCross][xCross-1] !== '#')|| (xCross<14 && crossword[yCross][1+xCross] !== '#')){
         return false;
    }

    if(x>=1 && crossword[y][x-1] !== '#'){
      return false;
    } else if(word.length+x<=13 && crossword[y][word.length+x] !== '#'){
        return false;
    }

    for(let i=0;i<word.length;i++){
      //check for another vertical word here
      if(crossword[y][x] !== '#' &&  crossword[y][x] !== word.charAt(i)){
        return false;
      }
      //check to see if neighbors are occupied
      if(crossword[y][x] === '#'){
        if((y>=1 && crossword[y-1][x] !== '#') || (y<=13 && crossword[1+y][x] !== '#')){
          return false;
        } else if((y===0 && crossword[1+y][x] !== '#') || (y===14 && crossword[y-1][x] !== '#')){
          return false;
        }
      }
      x++;
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
  let startPositions = [];
  let clueNumber = 1;
  let lastClueNumber, y, x, clue,direction;
  let acrossClues =[];
  let downClues = [];
  for(let i=0;i<placedWords.length;i++){
    y = placedWords[i].startPosition[0];
    x = placedWords[i].startPosition[1];
    direction = placedWords[i].direction;
    if(alreadyHasPosition(placedWords[i].startPosition,startPositions)){
      lastClueNumber = clueNumber;
      clueNumber = alreadyHasPosition(placedWords[i].startPosition,startPositions);
      clue = $(`<p>${clueNumber}. ${placedWords[i].clue}</p><p><button type="button" class="btn btn-default reveal" name="${i}">Reveal Word for Clue ${clueNumber}-${direction}</button></p`);
      clueNumber = lastClueNumber;
    } else{
      startPositions.push([y,x,clueNumber]);
      //add clue number to crossword puzzle
      let id = '#'+y+'-'+x;
      $(''+id).append('<sup>'+clueNumber+'</sup>');
      clue = $(`<p>${clueNumber}. ${placedWords[i].clue}</p><p><button type="button" class="btn btn-default reveal" name="${i}">Reveal Word for Clue ${clueNumber}-${direction}</button></p`);
    }
    clueNumber++;
    if(placedWords[i].direction === 'across'){
      $('.across').append(clue);
    } else if(placedWords[i].direction === 'down'){
      $('.down').append(clue);
    }
  }
}

function alreadyHasPosition(startPosition,arrayOfStarts){
  for(let i=0;i<arrayOfStarts.length;i++){
    if(arrayOfStarts[i][0] === startPosition[0] && arrayOfStarts[i][1]===startPosition[1]){
      return arrayOfStarts[i][2];
    }
  }
  return false;
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
  let index = $(this).attr("name");
  let wordObject = placedWords[parseInt(index)];
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
