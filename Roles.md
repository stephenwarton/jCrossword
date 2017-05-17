# Roles

## User
* Any person that visits the page
* A person that wants to solve a crossword puzzle

## Stories
* As a User I want a crossword puzzle to be generated on page load so that I can solve it.
  * Get a list of words and clues from API
  * Determine how to add a word to the puzzle
    * Arrangement, direction
    * Words should have at least one intersection
    * Have at least 5 words
* As a User I want to be able to fill in the crossword puzzle on the page.
* As a User I want to see the clues so that I can solve the puzzle.
  * get clues from API
  * display them on page
* As a User I want to see a description of the game before playing
  * Navbar shows name of app
  * Paragraph explaining how to play
* As a User I want to start a new crossword game
  * A start button is on the page
  * When start button is clicked, redirect to game
* As a User I want to know whether my answer is correct or not
  * A submit button to check answers
* As a User I want to be able to play on multiple screen sizes or devices
  * As a User I want to be able to solve the crossword puzzle on mobile
* As a User I want to ask for and be given hints
  * Hints in the form of filling in random letters of a word
  * Hints in the form of filling in random letters for the entire puzzle
* As a User I want more words that go across
* As a User I want to be able to fill in the crossword puzzle without needing to click on each box
  * As a User I want cursor to automatically move when filling in words
  * As a User I want the cursor to move on tab or enter
