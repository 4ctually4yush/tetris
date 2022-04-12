const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const ROW = 20;
const COL = 10;
const SQ = 25;

let p;
let pNext;
let r1;
let r2;
let b;
let highscore = 0;

ctx.scale(SQ,SQ);

//draw the basic canvas
ctx.fillStyle = "black";
ctx.fillRect(0,0,COL,ROW);
ctx.fillRect(11,1,6,6);
ctx.lineWidth = 0.05;
ctx.strokeStyle = "wheat";
ctx.strokeRect(0,0,COL,ROW);
ctx.strokeRect(11,1,6,6);
let f = new FontFace("arcade-font", "url(./media/arcade-font.ttf)");
f.load().then(() => { 
    ctx.fillStyle = "wheat";
    ctx.font = "1.2px arcade-font";
    ctx.fillText("Next Piece",11,1);
})


//draw a particular square
function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    ctx.lineWidth = 0.05;
    ctx.strokeStyle  = "black";
    ctx.strokeRect(x, y, 1, 1);
    ctx.strokeStyle = "wheat";
    ctx.strokeRect(0,0,COL,ROW);
    ctx.strokeRect(11,1,6,6);
}

//generate 2 distinct random pieces and draw them
r1 = Math.floor(Math.random() * Object.keys(TETROMINO).length);
function randomPiece(){
    do {
       r2 = Math.floor(Math.random() * Object.keys(TETROMINO).length);
    }while(r1 === r2);
    p =  new Piece(TETROMINO[r1+1][0], TETROMINO[r1+1][1]);
    p.Draw();
    pNext = new Piece(TETROMINO[r2+1][0], TETROMINO[r2+1][1]);
    ctx.fillStyle = "black";
    ctx.fillRect(11,1,6,6);
    setTimeout(drawNext, 200);
    r1 = r2;
}

//draw the upcoming piece
function drawNext(){
    for(let r = 0; r < pNext.activeTetromino.length; r++){
        for(let c = 0; c < pNext.activeTetromino.length; c++){
            if( pNext.activeTetromino[r][c]){
                drawSquare(12 + c,3 + r, pNext.color);
            }
        }
    }
}

//defining all propetries for a particular game
class Canvas{
    constructor(){
        //define board as matrix and fill with 0
        this.board = Array.from({length: ROW}, () => Array(COL).fill(0));
        this.level = 1;
        this.score = 0;
        this.gameOver = false;
        this.newTime = 0;
        this.dropInterval = 1000;
        this.pause = false;
        this.levelUpFlag = false;
    }
    drawCanvas(){
        for(let r = 0; r < ROW; r++){
            for(let c = 0; c < COL; c++){
                let color = (b.board[r][c] === 0) ? "black" : TETROMINO[b.board[r][c]][1] 
                drawSquare(c,r,color);
            }
        }
    }
}

//defining all properties for a particular tetromino
class Piece{
    constructor(tetromino, color){
        this.tetromino = tetromino;
        this.color = color;
        this.orientation = 0;
        this.activeTetromino = this.tetromino[this.orientation];
        this.x = 3;
        this.y = -3;
    }
    fill(color){
        for(let r = 0; r < this.activeTetromino.length; r++){
            for(let c = 0; c < this.activeTetromino.length; c++){
                if(this.activeTetromino[r][c]){
                    drawSquare(this.x + c,this.y + r, color);
                }
            }
        }
    }
    Draw(){
        this.fill(this.color);
    }
    unDraw(){
        this.fill("black");
    }
    //movement and collision functions
    moveLeft(){
        if(!this.collision(-1,0,this.activeTetromino)){
            this.unDraw();
            this.x--;
            this.Draw();
        }
    }
    moveRight(){
        if(!this.collision(1,0,this.activeTetromino)){
            this.unDraw();
            this.x++;
            this.Draw();
        }
    }
    moveDown(){
        if(!this.collision(0,1,this.activeTetromino)){
            this.unDraw();
            this.y++;
            this.Draw();
        } else {
            this.freeze();
            randomPiece();
    
        }
    }
    rotate(){
        let nextTetromino = this.tetromino[(this.orientation + 1)%(this.tetromino.length)];
        let shift = 0;
        //if piece collides on rotation we shift piece to check rotation
        if(this.collision(0,0,nextTetromino)){
            //in right half so shift left
            if(this.x > COL/2){
                if(!this.collision(-1,0,nextTetromino)){ shift = -1; }
                else { shift = -2; }
            }
            //in left half so shift right
            else{
                if(!this.collision(1,0,nextTetromino)){ 
                    shift = 1;
                } else { 
                    shift = 2;
                }
            }
        }
        //if no collision we change orientation
        if(!this.collision(shift,0,nextTetromino)){
            this.unDraw();
            this.x+= shift;
            this.orientation = (this.orientation + 1)%(this.tetromino.length);
            this.activeTetromino = this.tetromino[this.orientation];
            this.Draw();
        }
    }

    collision(x,y,piece){
        for(let r = 0; r < piece.length; r++){
            for(let c = 0; c < piece.length; c++){
                //If tetromino square is empty we skip
                if(!piece[r][c]){
                    continue;
                }
                //If coord after movement is out of canvas
                //return true
                let newX = this.x + c + x;
                let newY = this.y + r + y;
                if(newX < 0 || newX >= COL || newY >= ROW){
                    return true;
                }
                //skip piece above canvas that is dropping
                if(newY < 0){
                    continue;
                }
                //If another piece is present at
                //coords after movement
                //return true
                if(b.board[newY][newX] !== 0){
                    return true;
                }
            }
        }
        return false;
    }
   
    freeze(){
        //freeze piece
        for(let r = 0; r < this.activeTetromino.length; r++){
            for(let c =0; c < this.activeTetromino.length; c++){
                if(!this.activeTetromino[r][c]){ 
                    continue;
                }
                //If y-coord of tetromino square is < 0
                //set game over = true
                if(this.y + r < 0){
                    b.gameOver = true;
                    break;
                }
                b.board[this.y+r][this.x+c] = this.activeTetromino[r][c];
            }
        }
        //clear filled row
        for(let r = 0; r < ROW; r++){
            let isRowFull = true;
            for(let c = 0; c < COL; c++){
                if(b.board[r][c] === 0){ 
                    isRowFull = false;
                    break;
                }
            }
            if(isRowFull){
                for(let y = r; y > 1; y--){
                    for(let c = 0; c < COL; c++){
                        //shift all rows 1 down to fill empty row
                        b.board[y][c] = b.board[y-1][c];
                    }
                }
                //fill top row with 0 as it'll be empty
                b.board[0].fill(0);
                b.score+= 100;
                b.levelUpFlag = true;
                document.getElementById("score").innerHTML = b.score;
                if(highscore < b.score){
                    highscore = b.score;
                    document.getElementById("highscore").innerHTML = highscore;
                }
            }
        }
        //draw canvas after changes
        b.drawCanvas();
        if(b.gameOver){
            gameOverAnimation();
        }
    }
}

//Fade-In game-over text animation
function gameOverAnimation(){
    let opacity = 0;
    let intervalID = setInterval(() => {
        ctx.font = "0.9px retro-font";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255," + opacity + ")";
        ctx.fillText("Game Over", COL/2, ROW/2);
        opacity+= 0.01;
        if(opacity >= 1 ){
            clearInterval(intervalID);
        }
        document.getElementById("start").onclick = () => {
            clearInterval(intervalID);
        }
    } ,50);
    document.getElementById("start").innerHTML = "TRY AGAIN";
}

document.addEventListener("keydown", event =>{
    if(!b.gameOver){
        switch(event.code){
            case "KeyA":
                p.moveLeft();
                break;
            case "KeyD":
                p.moveRight();
                break;
            case "KeyS":
                p.moveDown();
                break;
            case "KeyW":
                p.rotate();
                break;
            case "KeyP":
                b.pause = !b.pause;
                drop();
            }
    }
})

//piece drop at a given speed
function drop(time = 0) {
    const deltaT = time - b.newTime;
    //speed increases after every 500 points
    if(b.score >= 500*b.level && b.levelUpFlag){
        b.dropInterval*= 0.75;
        b.level++;
        document.getElementById("level").innerHTML = b.level;
        //level up flag to increase speed only once
        //after every level
        b.levelUpFlag = false;
    }
    if(deltaT > b.dropInterval){
        p.moveDown();
        b.newTime = time;
    }
    if(!(b.gameOver || b.pause)){
        requestAnimationFrame(drop);
    }
}


//setup everything for a new game
start.addEventListener("click", () => {
    if(document.getElementById("start").innerHTML === "START" ||
       document.getElementById("start").innerHTML === "TRY AGAIN"){
        document.getElementById("start").innerHTML = "RESET";
    }
    b = new Canvas();
    b.drawCanvas();
    document.getElementById("score").innerHTML = b.score;
    document.getElementById("level").innerHTML = b.level;
    randomPiece();
    drop();     
});
