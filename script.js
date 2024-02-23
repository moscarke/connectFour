var playerRed = "R", playerYellow = "Y", currPlayer = playerRed, gameOver = false, board, rows = 6, columns = 7, currColumns = [], playAs, checkMoveInterval, wait = false;
const appScriptUrl = "https://script.google.com/macros/s/AKfycbweogJT1SJLPxWVSdb0WEL570FPqOgCCY6THQqao1hNKcYSvGZm5zGhOmw8BdSGC7TQ_Q/exec";

/*window.onload = function() {
    setGame();
}*/

async function checkPassword(player) {
	document.getElementsByClassName("startBtn")[0].disabled = true;
	document.getElementsByClassName("startBtn")[1].disabled = true;
	document.getElementById("error").innerText = "Checking...";
	const passW = document.getElementById("passwordInput").value;
	const raw = await fetch(appScriptUrl + "?q=passwordCheck&content=" + passW);
	const response = await raw.json();
	document.getElementById("passwordInput").value = "";
	if(response["password"]){
		window.addEventListener("beforeunload", beforeUnloadHandler);
		setGame(player);
	} else {
		document.getElementById("error").innerText = "Error: Game code is wrong";
		document.getElementsByClassName("startBtn")[0].disabled = false;
		document.getElementsByClassName("startBtn")[1].disabled = false;
	}
}

function setGame(player) {
	currPlayer = player;
	if (player == playerRed){
		playAs = playerRed;
	} else {
		playAs = playerYellow;
	}
	document.getElementById("playerSelection").style.display = "none";
	document.getElementById("board").style.display = "";
	checkMove(true);
	checkMoveInterval = setInterval(checkMove, 4000);
	
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            // JS
            row.push(' ');
            // HTML
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.addEventListener("click", setPiece);
            document.getElementById("board").append(tile);
        }
        board.push(row);
    }
}

function setPiece() {
    if (gameOver || currPlayer != playAs) {
        return;
    }

    //get coords of that tile clicked
    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    // figure out which row the current column should be on
    r = currColumns[c]; 

    if (r < 0) { // board[r][c] != ' '
        return;
    }

    board[r][c] = currPlayer; //update JS board
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    if (currPlayer == playerRed) {
        tile.classList.add("red-piece");
        currPlayer = playerYellow;
		document.getElementById("winner").innerText = "Waiting for yellow...";
    }
    else {
        tile.classList.add("yellow-piece");
        currPlayer = playerRed;
		document.getElementById("winner").innerText = "Waiting for red...";
    }

    r -= 1; //update the row height for that column
    currColumns[c] = r; //update the array
	
	const url = appScriptUrl + "?q=input&content=" + JSON.stringify(board);
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);

	xhttpr.send();
	wait = new Date();

    checkWinner();
}

function checkMove(initial) {
	const url = appScriptUrl;
	const xhttpr = new XMLHttpRequest();
	const sendTime = new Date();
	xhttpr.open("GET", url, true);

	xhttpr.send();
	
	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response)["board"];
			if (JSON.stringify(response) == JSON.stringify(board) || sendTime < wait){
				return;
			}
			
			output:
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < columns; c++) {
					if (response[r][c] == board[r][c]){
						continue;
					}
					
					let tile = document.getElementById(r.toString() + "-" + c.toString());
					if (response[r][c] == playerRed){
						tile.classList.add("red-piece");
					} else if (response[r][c] == playerYellow){
						tile.classList.add("yellow-piece");
					} else {
						return;
					}
					
					currColumns[c] = currColumns[c] - 1;
					if (!initial){
						if (currPlayer == playerRed) {
							currPlayer = playerYellow;
						}
						else {
							currPlayer = playerRed;
						}
						document.getElementById("winner").innerText = "Your turn!";
						board = response;
						checkWinner();
						return;
					}
				}
			}
			board = response;
			checkWinner();
		}
	}
}

function checkWinner() {
     // horizontal
     for (let r = 0; r < rows; r++) {
         for (let c = 0; c < columns - 3; c++){
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]) {
                    setWinner(r, c);
                    return;
                }
            }
         }
    }

    // vertical
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    // anti diagonal
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2] == board[r+3][c+3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    // diagonal
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }
}

function setWinner(r, c) {
    let winner = document.getElementById("winner");
    if (board[r][c] == playerRed) {
        winner.innerText = "Red Wins";             
    } else {
        winner.innerText = "Yellow Wins";
    }
    gameOver = true;
	clearInterval(checkMoveInterval);
	window.removeEventListener("beforeunload", beforeUnloadHandler);
}

function beforeUnloadHandler(event) {
  // For modern browser
  event.preventDefault();

  // Included for legacy support, e.g. Chrome/Edge < 119. Safari
  event.returnValue = true;
}