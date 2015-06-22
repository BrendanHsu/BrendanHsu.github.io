function setup()
{
	game = new gamestate();
	iterations = 100000;
}

function gamestate()
{
	this.board = [[0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0]];
	this.lastPlayer = 2;
	this.movesRemaining = [0,1,2,3,4,5,6];
	this.spacesLeft = [6,6,6,6,6,6,6] //this will be empty if there are no moves left (draw)
	this.winner = 0;
	this.isclone = false;

	this.move = function move(col)
	{
		this.lastPlayer = 3 - this.lastPlayer; //update player
		var row = this.spacesLeft[col] - 1;
		this.board[row][col] = this.lastPlayer;

		//update graphics if it's the real game.	
		if (!this.isclone) {
			if (this.lastPlayer == 1) {
				$("#r" + row + "c" + col).css("background-image", "url(redtile.jpg)");
			} else {
				$("#r" + row + "c" + col).css("background-image", "url(blacktile.jpg)");
			}
		};

		this.spacesLeft[col]--;
		if (this.spacesLeft[col] <= 0) {
			this.removeMove(this.movesRemaining, col);
		};
		if (checkWinner.call(this, row, col)) {
			this.winner = this.lastPlayer;
			for (var i = this.movesRemaining.length - 1; i >= 0; i--) this.movesRemaining.splice(i, 1);
			for (var j = 0; j <= 6; j ++) this.spacesLeft[j] = 0;
		};

		if (!this.isclone && this.movesRemaining.length == 0) {
			endGame(this.winner);
		};
	}

	function checkWinner(row, col)
	{
		var vertConx = 0;
		var horConx = 0;
		var lrDiagConx = 0;
		var rlDiagConx = 0;

		//vertical
		var checkRow = row;
		var checkCol = col;
		while(checkRow <= 5) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				vertConx++;
				checkRow++;
			}else checkRow = 6;
		};

		//horizontal;
		checkRow = row;
		checkCol = col;
		while(checkCol >= 0) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				horConx++;
				checkCol--;
			}else checkCol = -1;
		};

		checkCol = col + 1;
		while(checkCol <= 6) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				horConx++;
				checkCol++;
			}else checkCol = 7;
		};

		//Left-to-right diagonal
		checkRow = row;
		checkCol = col;
		while(checkCol >= 0 && checkRow >= 0) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				lrDiagConx++;
				checkCol--;
				checkRow--;
			}else checkCol = -1;
		};

		checkRow = row + 1;
		checkCol = col + 1;
		while(checkCol <= 6 && checkRow <= 5) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				lrDiagConx++;
				checkCol++;
				checkRow++;
			}else checkCol = 7;
		};

		//Right-to-left diagonal
		checkRow = row;
		checkCol = col;
		while(checkCol <= 6 && checkRow >= 0) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				rlDiagConx++;
				checkCol++;
				checkRow--;
			}else checkCol = 7;
		};

		checkRow = row + 1;
		checkCol = col - 1;
		while(checkCol >= 0 && checkRow <= 5) {
			if (this.board[checkRow][checkCol] == this.lastPlayer) {
				rlDiagConx++;
				checkCol--;
				checkRow++;
			}else checkCol = -1;
		};

		if (vertConx >= 4 || horConx >= 4 || lrDiagConx >= 4 || rlDiagConx >= 4) {
			return true;
		}else{
			return false;
		};
	}

	this.removeMove = function removeMove(a, mo)
	{
		for (var i = a.length - 1; i >= 0; i--) {
			if (a[i] == mo) {
				a.splice(i, 1);
			}
		}
	}

	function endGame(w)
	{
		if (w == 0) alert("Draw! Play again?")
		else if(w == 1) alert("Red Player wins! Play again?")
		else alert("Black Player wins! Play again?");
		location.reload();
	}

	this.getResult = function getResult(player)
	{
		if (this.winner == 0) {
			return 0.5;
		}else if (this.winner == player){
			return 1.0;
		}else return 0.0;
	}

	this.clone = function clone()
	{
		var st = new gamestate();
		for (var r = 0; r <= 5; r++) {
			for (var c = 0; c <= 6; c++) {
				st.board[r][c] = this.board[r][c];
			}
		}
		st.lastPlayer = this.lastPlayer;
		st.movesRemaining = [];
		for (var i = this.movesRemaining.length - 1; i >= 0; i--) {
			st.movesRemaining.push(this.movesRemaining[i]);
		}
		st.spacesLeft = [];
		for (var j = this.spacesLeft.length - 1; j >= 0; j--) {
			st.spacesLeft.push(this.spacesLeft[j]);
		}		
		st.winner = this.winner;
		st.isclone = true;
		return st;
	}

	this.chooseRandomMove = function chooseRandomMove()
	{
		var randIndex = Math.floor(Math.random() * this.movesRemaining.length);
		return this.movesRemaining[randIndex];
	}
}

function Node(m, p, s)
{
	this.children = [];
	this.parent = p;
	this.visits = 0.0;
	this.wins = 0.0;
	this.move = m;
	this.lastPlayer = s.lastPlayer;
	this.untriedMoves = [];

	for (var index = 0; index < s.movesRemaining.length; index++){
		this.untriedMoves.push(s.movesRemaining[index]);
	};

	this.newChild = function newChild(mo, st)
	{
		var n = new Node(mo, this, st);
		this.deleteMove(this.untriedMoves, mo);
		this.children.push(n);
		return n;
	}

	this.deleteMove = function deleteMove(a, mo)
	{
		for (var i = a.length - 1; i >= 0; i--) {
			if (a[i] == mo) {
				a.splice(i, 1);

			}
		};
	}

	this.update = function update(i)
	{
		this.visits++;
		this.wins += i;
	}

	this.selectChild = function selectChild()
	{
		var n = null;
		var best = Number.MIN_VALUE;
		var tune = 0.001;
		for (var i = 0; i < this.children.length; i++) {
			var curr = this.children[i];
			var UCTVal = (curr.wins)/(curr.visits+tune) + Math.sqrt(2*(Math.log(curr.visits+1))/(curr.visits+tune));

			if (UCTVal > best) {
				n = curr;
				best = UCTVal;
			}
		}
		return n;
	}
}

function UCT(rootS, maxIterations)
{
	var rootNode = new Node(null, null, rootS);

	for (var i = 0; i < maxIterations; i++) {
		var mynode = rootNode;
		var state = rootS.clone();

		//select nodes
		while (mynode.untriedMoves.length == 0 && mynode.children.length != 0) {
			mynode = mynode.selectChild();
			state.move(mynode.move);
		}

		//expand nodes
		if (mynode.untriedMoves.length != 0) {
			var randmove = state.chooseRandomMove();
			state.move(randmove);
			mynode = mynode.newChild(randmove, state);
		}

		//move
		while (state.movesRemaining.length != 0) {
			state.move(state.chooseRandomMove());
		}

		//get back to root
		while (mynode != null) {
			mynode.update(state.getResult(mynode.lastPlayer));
			mynode = mynode.parent;
		}
	}

	var n = null
	var best = Number.MIN_VALUE;
	for (var i = 0; i < rootNode.children.length; i++) {
		var curr = rootNode.children[i];

		if (curr.visits > best) {
			n = curr;
			best = curr.visits;
		};

	}
	return n.move;
}

function button1()
{
	if (game.spacesLeft[0] > 0) {
		game.move(0);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}

function button2()
{
	if (game.spacesLeft[1] > 0) {
		game.move(1);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}

function button3()
{
	if (game.spacesLeft[2] > 0) {
		game.move(2);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}

function button4()
{
	if (game.spacesLeft[3] > 0) {
		game.move(3);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}

function button5()
{
	if (game.spacesLeft[4] > 0) {
		game.move(4);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}

function button6()
{
	if (game.spacesLeft[5] > 0) {
		game.move(5);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}

function button7()
{
	if (game.spacesLeft[6] > 0) {
		game.move(6);
		var AImove = UCT(game, iterations);
		game.move(AImove);
	};
}
