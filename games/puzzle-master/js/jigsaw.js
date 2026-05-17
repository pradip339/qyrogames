var Jigsaw = function () {
    var container;
    var puzzleImg = {};
    var pieces = [];
    var gridSize = 3;
    var puzzleWidht = puzzleHeight = Math.min($(window).width(), 512) - 60;
    var gameActive = false;

    var Piece = function (row, col, size) {
        this.row = row;
        this.col = col;
        this.size = size;
        this.newRow = row;
        this.newCol = col;

        this.movePiece = function (row, col, animate) {
            this.newRow = row;
            this.newCol = col;
            if (animate !== false) {
                $(this.pieceEle).animate({
                    left: this.newRow * size,
                    top: this.newCol * size,
                }, {
                    duration: 200,
                    easing: 'linear'
                });
            } else {
                $(this.pieceEle).css({
                    left: this.newRow * size,
                    top: this.newCol * size,
                });
            }
        }

        this.createPiece = function (container) {
            this.pieceEle = document.createElement('div');
            $(this.pieceEle).css({
                position: 'absolute',
                left: row * size,
                top: col * size,
                height: size - 4 + 'px',
                width: size - 4 + 'px',
                margin: '2px',
                'background-image': 'url(' + puzzleImg.url + ')',
                'background-position-x': this.row * size * -1,
                'background-position-y': this.col * size * -1,
                'background-size': puzzleWidht,
                'background-repeat': 'no-repeat',
                'transition': 'box-shadow 0.3s ease',
                'border-radius': '4px',
                'cursor': 'pointer',
                'box-shadow': '0 1px 3px rgba(0,0,0,0.15)'
            });
            $(container).append(this.pieceEle);
        }

        this.removePiece = function () {
            $(this.pieceEle).remove();
        }
    }

    function initPuzzle(opt) {
        opt = opt || {};
        gridSize = Math.max(opt.gridSize || 3, 3);
        container = opt.container;
        loadPuzzleImage(opt.image);
    }

    function loadPuzzleImage(image) {
        let img = document.createElement('img');
        img.onload = function (e) {
            puzzleImg.url = img.src;
            $(container).css({
                width: puzzleWidht,
                height: puzzleHeight
            });
            preparePieces();
            setTimeout(function () {
                scramblePuzzle();
            }, 500);
        }
        img.src = image || '/games/puzzle-master/images/monkey.png';
    }

    function preparePieces() {
        $(container).empty();
        pieces = [];
        var piceSize = puzzleWidht / gridSize;
        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                if (i === gridSize - 1 && j === gridSize - 1) continue; 
                var piece = new Piece(i, j, piceSize);
                piece.createPiece(container);
                pieces.push(piece);

                
                $(piece.pieceEle).on('click', function () {
                    if (!gameActive) return;
                    handlePieceClick(this);
                });
            }
        }
        gameActive = false;
    }

    function handlePieceClick(element) {
        var clickedPiece = pieces.find(p => p.pieceEle === element);
        if (!clickedPiece) return;

        var emptyPos = getEmptyPosition();
        if (isAdjacent(clickedPiece.newRow, clickedPiece.newCol, emptyPos.row, emptyPos.col)) {
            clickedPiece.movePiece(emptyPos.row, emptyPos.col);
            checkWin();
        }
    }

    function getEmptyPosition() {
        var occupied = pieces.map(p => ({ row: p.newRow, col: p.newCol }));
        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                if (!occupied.some(p => p.row === i && p.col === j)) {
                    return { row: i, col: j };
                }
            }
        }
    }

    function isAdjacent(row1, col1, row2, col2) {
        return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2);
    }

    function scramblePuzzle() {
        gameActive = false;
        var moves = gridSize * gridSize * 30; 
        while (moves > 0) {
            var emptyPos = getEmptyPosition();
            var adjacentPieces = pieces.filter(p => isAdjacent(p.newRow, p.newCol, emptyPos.row, emptyPos.col));
            var randomPiece = adjacentPieces[Math.floor(Math.random() * adjacentPieces.length)];

            
            randomPiece.newRow = emptyPos.row;
            randomPiece.newCol = emptyPos.col;
            moves--;
        }

        
        pieces.forEach(piece => {
            $(piece.pieceEle).animate({
                left: piece.newRow * piece.size,
                top: piece.newCol * piece.size,
            }, {
                duration: 500,
                easing: 'linear'
            });
        });

        
        setTimeout(() => {
            gameActive = true;
            if (window.startTimer) window.startTimer();
        }, 550);
    }

    function checkWin() {
        var isSolved = pieces.every(p => p.newRow === p.row && p.newCol === p.col);
        if (isSolved && gameActive) {
            gameActive = false;
            if (window.stopTimer) window.stopTimer();

            
            setTimeout(() => {
                alert("🎉 Congratulations! Puzzle Solved!");
                
            }, 500);
        }
    }

    return {
        init: initPuzzle
    };
};

