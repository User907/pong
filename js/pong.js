var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
var rounds = [11, 11, 11];
var colors = ["#820210","#014310", "#D8540C", "#2B00EF"];
 
// Objeto da bola
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 7 
        };
    }
};
 
// O objeto da ia
var p2 = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};

// Configurações do jogo
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1400;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
 
        this.player = p2.new.call(this, 'left');
        this.p2 = p2.new.call(this, 'right');
        this.ball = Ball.new.call(this);
        
        this.ball.speed = 10;
        this.p2.speed = 9;
        this.running = this.over = false;
        this.turn = this.player;
        this.timer = this.round = 0;
        this.color = '#8c52ff';
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        // Muda a fonte do canvas e sua cor
        Pong.context.font = '45px Arial';
        Pong.context.fillStyle = this.color;
 
        // Desenha o retângulo atrás do texto Pressione qualquer tecla para começar
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Muda a cor do canvas
        Pong.context.fillStyle = '#000000';
 
        // Desenhar a tela de fim de jogo(" Vencedor ", "Game Over")
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        // Desenha os objetos
        Pong.draw();
 
        // Muda as cores e fonte do canvas
        this.context.font = '50px Arial';
        this.context.fillStyle = this.color;
 
        // Desenha o retângulo atrás do texto Pressione qualquer tecla para começar
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Muda a cor do canvas
        this.context.fillStyle = '#ffffff';
 
        // Escreve o texto "Pressione qualquer tecla para começar"
        this.context.fillText('Pressione qualquer tecla para começar',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    // Atualiza todos os objetos, movimento do jogador, da bola e da ia, muda os pontos
    update: function () {
        if (!this.over) {
            //Se a bola colidir com os limites do mapa, direciona ela para o lado contrário
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.p2, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.p2);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
 
            // Movimentação do jogador, quanto uma tecla de movimento for apertada
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

            // Movimentação do jogador 2, quanto uma tecla de movimento for apertada
            if (this.p2.move === DIRECTION.UP) this.p2.y -= this.p2.speed;
            else if (this.p2.move === DIRECTION.DOWN) this.p2.y += this.p2.speed;
 
            // No saque, depois que um ponto é feito, a bola é colocada no meio do mapa
            // e sua direção vai contra quem sofreu o ponto, indo de modo randomizado, para cima ou para baixo
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = (this.turn === this.player)? DIRECTION.LEFT : DIRECTION.RIGHT,  (this.turn === this.p2)? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = 500;
                this.turn = null;
            }
 
            // Se o jogador colidir com os limites do mapa, fazer com que ele não passe deles
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 

            // Se o jogador 2 colidir com os limites do mapa, fazer com que ele não passe deles
            if (this.p2.y <= 0) this.p2.y = 0;
            else if (this.p2.y >= (this.canvas.height - this.p2.height)) this.p2.y = (this.canvas.height - this.p2.height);

            // Mover a bola na direção que for indicada pelos painéis(jogadores)
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
 
                }
            }
 
            // Handle p2-ball collision
            if (this.ball.x - this.ball.width <= this.p2.x && this.ball.x >= this.p2.x - this.p2.width) {
                if (this.ball.y <= this.p2.y + this.p2.height && this.ball.y + this.ball.height >= this.p2.y) {
                    this.ball.x = (this.p2.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
 
                }
            }
        }
 
        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === rounds[this.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.color = this._generateRoundColor();
                this.player.score = this.p2.score = 0;
                this.player.speed += 0.5;
                this.p2.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
 
            }
        }
        // Check to see if the p2/p2 has won the round.
        else if (this.p2.score === rounds[this.round]) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },
 
    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to black
        this.context.fillStyle = this.color;
 
        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';
 
        // Draw the Player
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        // Draw the p2
        this.context.fillRect(
            this.p2.x,
            this.p2.y,
            this.p2.width,
            this.p2.height 
        );
 
        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
 
        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        // Set the default canvas font and align it to the center
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        // Draw the players score (left)
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // Draw the paddles score (right)
        this.context.fillText(
            this.p2.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        // Change the font size for the center score text
        this.context.font = '30px Courier New';
 
        // Draw the winning score (center)
        this.context.fillText(
            'Round ' + (Pong.round + 1),
            (this.canvas.width / 2),
            35
        );
 
        // Change the font size for the center score value
        this.context.font = '40px Courier';
 
        // Draw the current round number
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
 
            // Handle up arrow and w key events
            if (key.keyCode === 38)Pong.p2.move = DIRECTION.UP;
 
            // Handle down arrow and s key events
            if (key.keyCode === 40) Pong.p2.move = DIRECTION.DOWN;

            // Handle up arrow and w key events
            if (key.keyCode === 87)Pong.player.move = DIRECTION.UP;
 
            // Handle down arrow and s key events
            if (key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });
 
        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });

        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) { Pong.p2.move = DIRECTION.IDLE; });
    },
 
    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    // Select a random color as the background of each level/round.
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();