'use strict';

(function() {
  var whichPlayerStart = null;
  var board = null;
  var cells = null;
  var gameOver = null;
  var modal = null;

  function removeBlur() {
    if (gameOver !== null) {
      document.body.removeChild(gameOver);
      gameOver = null;
    }

    var gameElement = document.querySelector('.game');
    if (gameElement.classList.contains('blur')) {
      gameElement.classList.remove('blur');
    }

    return gameElement;
  }

  function createModal() {
    var gameElement = null;
    gameElement = removeBlur();
    gameElement.innerHTML = '';

    var modalElement = null;
    modalElement = document.createElement('div');
    modalElement.classList.add('modal');
    gameElement.appendChild(modalElement);

    var inputs = [];
    var icons = ['circle-icon', 'cross-icon'];

    var rowElement = null;
    var inputElement = null;
    var playerIcon = null;

    for (var i = 0; i < 2; i++) {
      rowElement = document.createElement('div');
      rowElement.classList.add('row');
      modalElement.appendChild(rowElement);

      inputElement = document.createElement('input');
      inputElement.classList.add('user-name');
      inputElement.type = 'text';
      inputElement.maxLength = '10';
      inputElement.placeholder = 'Gracz ' + (i + 1);
      rowElement.appendChild(inputElement);

      playerIcon = document.createElement('span');
      playerIcon.classList.add(icons[i]);
      rowElement.appendChild(playerIcon);

      inputs.push(inputElement);
    }

    var startGameButton = null;
    startGameButton = document.createElement('button');
    startGameButton.classList.add('start-game');
    startGameButton.type = 'button';
    startGameButton.title = 'Zacznij grę';
    startGameButton.textContent = 'Graj';
    modalElement.appendChild(startGameButton);

    startGameButton.addEventListener('click', startGame);

    return {
      player1: inputs[0],
      player2: inputs[1],
      modal: modalElement,
      gameElement: gameElement
    };
  }

  modal = createModal();

  function makeGameBoard() {
    var gameBoard = null;
    gameBoard = document.createElement('div');
    gameBoard.classList.add('game-board');

    modal.gameElement.appendChild(gameBoard);

    var cells = [];

    for (var i = 1; i < 10; i++) {
      var cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.sign = 'empty';
      gameBoard.appendChild(cell);

      cells.push(cell);
    }

    return {
      board: gameBoard,
      cells: cells
    };
  }

  function changeColorOfCurrentPlayer(players) {
    if (whichPlayerStart === 0) {
      players.secondPlayer.style.color = 'rgba(255, 255, 255, 0.25)';
      players.firstPlayer.style.color = '#ffffff';
    } else {
      players.firstPlayer.style.color = 'rgba(255, 255, 255, 0.25)';
      players.secondPlayer.style.color = '#ffffff';
    }
  }

  function showWinner() {
    var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'remis';

    gameOver = document.createElement('div');
    modal.gameElement.classList.add('blur');
    gameOver.classList.add('game-over');
    document.body.appendChild(gameOver);

    var winnerModal = null;
    winnerModal = document.createElement('div');
    winnerModal.classList.add('winner-modal');
    gameOver.appendChild(winnerModal);

    var winner = null;
    winner = document.createElement('p');
    winner.classList.add('winner-name');
    if (user === 'remis') {
      winner.textContent = 'Remis';
    } else if (user.charAt(user.length - 1) === 'a') {
      winner.textContent = user + ' wygra\u0142a';
    } else {
      winner.textContent = user + ' wygra\u0142';
    }
    winnerModal.appendChild(winner);

    var restartButton = null;
    restartButton = document.createElement('button');
    restartButton.type = 'text';
    restartButton.title = 'Powrót do menu';
    restartButton.classList.add('start-game');
    restartButton.textContent = 'Menu';
    winnerModal.appendChild(restartButton);

    restartButton.addEventListener('click', function() {
      modal = createModal();
    });

    var playAgainButton = null;
    playAgainButton = document.createElement('button');
    playAgainButton.type = 'text';
    playAgainButton.title = 'Jeszcze raz';
    playAgainButton.classList.add('start-game');
    playAgainButton.textContent = 'Jeszcze raz';
    winnerModal.appendChild(playAgainButton);

    playAgainButton.addEventListener('click', startGame);

    return true;
  }

  function resultOfGame(decision, players) {
    if (decision === 'draw') {
      return showWinner();
    } else if (decision === 'circle') {
      return showWinner(players.firstPlayer.textContent);
    } else if (decision === 'cross') {
      return showWinner(players.secondPlayer.textContent);
    }
  }

  function gameMechanic(signs, players) {
    var allPossibilities = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

    var data = cells.map(function(cell) {
      return cell.dataset.sign;
    });

    for (var i = 0; i < signs.length; i++) {
      for (var j = 0; j < allPossibilities.length; j++) {
        if (
          data[allPossibilities[j][0]] === signs[i] &&
          data[allPossibilities[j][1]] === signs[i] &&
          data[allPossibilities[j][2]] === signs[i]
        ) {
          return resultOfGame(signs[i], players);
        }
      }
    }

    if (data.indexOf('empty') === -1) {
      return resultOfGame('draw', players);
    }

    return false;
  }

  function draw(e, players) {
    var signs = ['circle', 'cross'];
    var target = e.target;
    var sign = null;

    if (target.className === 'cell' && !target.hasChildNodes()) {
      target.classList.add('selected');
      target.dataset.sign = signs[whichPlayerStart];
      sign = document.createElement('span');
      sign.classList.add(signs[whichPlayerStart]);
      target.appendChild(sign);

      if (gameMechanic(signs, players)) {
        board = null;
        cells = null;
        whichPlayerStart = null;
        return;
      }

      whichPlayerStart++;
      if (whichPlayerStart === 2) {
        whichPlayerStart = 0;
      }
      changeColorOfCurrentPlayer(players);
    }
  }

  function throttle(_ref) {
    var time = _ref.time,
      draw = _ref.draw,
      players = _ref.players;

    var wait = true;

    return function(e) {
      if (wait) {
        wait = false;
        draw(e, players);

        setTimeout(function() {
          wait = true;
        }, time);
      }
    };
  }

  function startGame() {
    var gameBoard = null;
    var players = null;
    whichPlayerStart = null;
    cells = null;
    board = null;
    removeBlur();
    modal.gameElement.innerHTML = '';

    whichPlayerStart = Math.round(Math.random());
    players = setUsersNames(modal.player1, modal.player2);
    gameBoard = makeGameBoard();
    board = gameBoard.board;
    cells = gameBoard.cells;

    var config = {
      time: 500,
      draw: draw,
      players: players
    };

    changeColorOfCurrentPlayer(config.players);

    board.addEventListener('click', throttle(config));
  }

  function setUsersNames() {
    var namePattern = /^\S{3,}$/i;
    var players = [];
    var namesOfPlayers = null;
    namesOfPlayers = document.createElement('div');
    namesOfPlayers.classList.add('names-of-players');
    modal.gameElement.appendChild(namesOfPlayers);

    for (var _len = arguments.length, playersNames = Array(_len), _key = 0; _key < _len; _key++) {
      playersNames[_key] = arguments[_key];
    }

    for (var i = 0; i < 2; i++) {
      var player = document.createElement('div');
      player.classList.add('player-name');
      if (namePattern.test(playersNames[i].value)) {
        player.textContent = playersNames[i].value;
      } else {
        player.textContent = 'Gracz ' + (i + 1);
      }
      namesOfPlayers.appendChild(player);
      players.push(player);

      if (i === 0) {
        var vsElement = document.createElement('span');
        vsElement.textContent = 'vs.';
        namesOfPlayers.appendChild(vsElement);
      }
    }

    return {
      firstPlayer: players[0],
      secondPlayer: players[1]
    };
  }
})();
