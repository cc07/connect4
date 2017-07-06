import { Component, ViewChild, OnInit } from '@angular/core';
import { XavierService } from './service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    
    @ViewChild('backgroundCanvas') bgCanvas;
    @ViewChild('canvas') canvas;
    
    message: string;
    bgContext: any;
    context: any;
    
    colSize: number;
    frameSize: number;
    actualFrameSize: number;
    startX: number;
    radius: number;
    
    gameMode: boolean;
    turnPlayer: number;
    winner: number = null;
    
    board: any;
    
    isDropingInMotion: boolean = false;    
    isGameStarted: boolean = false;
    isGameEnded: boolean = false;
    
    readonly RED = 1;
    readonly BLUE = -1;
    readonly HUMAN = false;
    readonly AI = true;
    readonly GAME_STATUS = {
        END: 0,
        DRAW: 1
    }
    
    config: any = {
        border: '#AAAAAA',
        blue: '#0066FF',
        red: '#F44336',
        top: 140,
        left: 40,
        colCount: 7,
        rowCount: 6
    }
    
    constructor(
        private xavierService: XavierService) {
        
    }
    
    ngOnInit() {

        this.bgContext = this.bgCanvas.nativeElement.getContext('2d');
        this.context = this.canvas.nativeElement.getContext('2d');
        
        this.bgContext.lineWidth = 1;
        this.bgContext.strokeStyle = this.config.border;        
                      
        this.turnPlayer = this.RED;
        this.computeSize();
        this.initGame();
    }
    
    initGame() {
        this.drawBoard();
        this.board = new Array(this.config.rowCount).fill(0).map(() => {
            return new Array(this.config.colCount).fill(0);
        });        
    }
    
    onClick(event) {
        
        let col = this.getPointingCol(event);

        if (this.isGameStarted && this.isPointingTheFirstRow(event) && this.allowToDrop(col)) {                        
            this.dropCoin(col);                        
        }
    }
    
    onMousemove(event) {
        
        if (!this.isGameStarted || this.isGameEnded) return;
        
        let col = Math.min(this.getPointingCol(event), this.config.colCount - 1);        
        this.drawCoin(col); 
    }
    
    computeSize() {
                
        this.frameSize = window.innerWidth * 0.8; 
        this.actualFrameSize = this.frameSize * 0.9;
        this.colSize = this.actualFrameSize / 7;     
        this.startX = (this.frameSize - this.actualFrameSize) / 2;                 
        
        this.bgCanvas.nativeElement.height = this.frameSize;
        this.bgCanvas.nativeElement.width = this.frameSize;                
        this.canvas.nativeElement.height = this.frameSize;
        this.canvas.nativeElement.width = this.frameSize;               
        
        this.bgCanvas.nativeElement.style.height = this.frameSize + 'px';
        this.bgCanvas.nativeElement.style.width = this.frameSize + 'px';
        this.canvas.nativeElement.style.height = this.frameSize + 'px';
        this.canvas.nativeElement.style.width = this.frameSize + 'px';        
        
        this.radius = this.colSize * 0.8 / 2;
    }
    
    onWindowResize() {
        this.computeSize();
        this.drawBoard();
        this.redraw();
    }    
    
    setGameMode(gameMode) {
        
        this.gameMode = gameMode;
        this.isGameStarted = true;
        this.turnPlayer = (this.winner) ? this.winner * -1 : Math.pow(-1, Math.floor((Math.random() * 10) + 1));
        this.setCoinColor();
        this.setMessage();
        
        if (this.gameMode == this.AI && this.turnPlayer == this.BLUE) {
            this.xavierService.requestDrop(this).then((col) => {
                this.dropCoin(col);
            });            
        }        
    }
    
    resetGame() {
        this.isGameStarted = false;
        this.isGameEnded = false;
        this.isDropingInMotion = false;
        this.clearBoard();
        this.initGame();
    }
    
    setMessage(gameStatus?) { 
        
        switch (gameStatus) {
            case this.GAME_STATUS.DRAW:
                this.message = 'Draw'
            break;
            case this.GAME_STATUS.END:
                this.message = (this.turnPlayer == this.RED ? 'Red' : 'Blue') + ' won';
            break;
            default:
                this.message = (this.turnPlayer == this.RED ? 'Red' : 'Blue') + '\'s turn';
            break;            
        }
    }
    
    drawBoard() {                        
        
        this.bgContext.clearRect(0, 0, this.frameSize, this.frameSize);
                
        for (let y = this.colSize, z = 0; z <= this.config.rowCount; y += this.colSize, z++) {        
            
            this.bgContext.beginPath();
            this.bgContext.moveTo(this.startX, y);
            this.bgContext.lineTo(this.actualFrameSize + this.startX, y);            
            this.bgContext.stroke();                        
                
        }
        
        for (let x = this.startX, z = 0; z <= this.config.colCount; x += this.colSize, z++) {
            
            this.bgContext.beginPath();
            this.bgContext.moveTo(x, this.colSize);
            this.bgContext.lineTo(x, this.actualFrameSize);
            this.bgContext.stroke();
            
        }                        
    }
    
    clearBoard() {
        this.context.clearRect(0, 0, this.frameSize, this.frameSize);
    }
    
    redraw() {
        for (let row of this.board) {
            for (let cell of row) {
                
                
            }
        }
        
        for (let row = 0; row < this.config.rowCount; row++) {
            for (let col = 0; col < this.config.colCount; col++) {
                if (this.board[row][col] == 0) continue;                
                this.drawCoin(col, row, this.getCoinColor(this.board[row][col]));
            }
        }
    }
    
    dropCoin(col: number) {
        
        let row = this.getAvailableRow(col);
        let start = Date.now();
        let [x, y] = this.getPosition(0, col); 
        let [endX, endY] = this.getPosition(row, col);
        
        let renderDrop = () => {
            
            let move = Date.now() - start;
            
            this.context.clearRect(x - this.radius - 1, y - this.radius - 1, (this.radius + 1)*2, (this.radius + 1)*2);

            y = Math.min(y + move, endY);                        

            this.context.beginPath();
            this.context.arc(x, y, this.radius, 0, Math.PI*2, true);
            this.context.fill();          
            
            if (y < endY) {
                requestAnimationFrame(renderDrop);
            } else {
                this.postDrop(row, col);
            }
               
        }
        
        this.isDropingInMotion = true;
        requestAnimationFrame(renderDrop);        
        
    }        
    
    allowToDrop(col: number): boolean {        
        return !this.isDropingInMotion && this.hasAvailableCell(col) && !this.isGameEnded;
    }        
    
    async postDrop(row: number, col: number) {
        
        this.printBoard();
        this.setOccupied(row, col);
        this.isGameEnded = await this.checkEndGame(row, col);               
        
        if (this.isGameEnded) {
            this.winner = this.turnPlayer;
            return this.setMessage(this.GAME_STATUS.END);
        }
        
        if (!this.hasAvailableMove()) {
            this.isGameEnded = true;
            return this.setMessage(this.GAME_STATUS.DRAW);
        }
        
        this.isDropingInMotion = false;        
        this.turnPlayer = this.turnPlayer * -1;
        this.setCoinColor();
        this.clearDraw();
        this.setMessage();
        
        if (this.gameMode == this.AI && this.turnPlayer == this.BLUE) { 
            this.xavierService.requestDrop(this).then((col) => {
                this.dropCoin(col);
            });
            
        }

    }    
    
    checkEndGame(row: number, col: number): Promise<boolean> {        
        return new Promise((resolve, reject) => {            
            
            let checking = [
                this.checkSouth(row, col, this.board),
                this.checkWest(row, col, this.board),
                this.checkEast(row, col, this.board),
                this.checkSouthWest(row, col, this.board),
                this.checkSouthEast(row, col, this.board),
                this.checkNorthWest(row, col, this.board),
                this.checkNorthEast(row, col, this.board),
                this.checkLeftSkewed(row, col, this.board),
                this.checkRightSkewed(row, col, this.board)
                
            ]
                    
             return Promise.all(checking).then((result) => {                                        
                for (let bar of result) {
                    
                    let pattern = new Array(4).fill(this.turnPlayer).join(',').replace(new RegExp('-1', 'g'), 'A');
                    let check = bar.cells.join(',').replace(new RegExp('-1', 'g'), 'A');
                    
                    if (bar.direction == 'ls' || bar.direction == 'rs') {
                        console.log(bar);
                        console.log('check', check);
                        console.log('pattern', pattern);                        
                    }
                    
                    if (check.includes(pattern)) {
                        resolve(true);
                    }
                }                
                resolve(false);
            }); 
        });     
    }
    
    checkSouth(row: number, col: number, board: any): Promise<any> {
        return new Promise((resolve, reject) => {
            
            let cells = [];

            while (row < this.config.rowCount) {
                cells.push(board[row][col]);
                row++;
            };            
            resolve({ direction: 's', cells: cells});
        });
    }
    
    checkEast(row: number, col: number, board: any): Promise<any> {                              
        return new Promise((resolve, reject) => {
            
            let cells = [];

            while (col < this.config.colCount) {
                cells.push(board[row][col]);
                col++;
            };              
            resolve({ direction: 'e', cells: cells});
        });        
    }
    
    checkWest(row: number, col: number, board: any): Promise<any> {          
        return new Promise((resolve, reject) => {
            
            let cells = [];

            while (col >= 0) {
                cells.push(board[row][col]);
                col--;
            };                  
            resolve({ direction: 'w', cells: cells});
        });                
    }
    
    checkSouthEast(row: number, col: number, board: any): Promise<any> {        
        return new Promise((resolve, reject) => {
            
            let cells = [];        

            while (col < this.config.colCount && row < this.config.rowCount) {
                cells.push(board[row][col]);

                col++;
                row++;
            };                            
            resolve({ direction: 'se', cells: cells});
        });                
    }
    
    checkSouthWest(row: number, col: number, board: any): Promise<any> {
        return new Promise((resolve, reject) => {
            
            let cells = [];        
            
            while (col >= 0 && row < this.config.rowCount) {
                cells.push(board[row][col]);

                col--;
                row++;
            };                            
            resolve({ direction: 'sw', cells: cells});
        });                
    }
    
    checkNorthWest(row: number, col: number, board: any): Promise<any> {
        return new Promise((resolve, reject) => {
            
            let cells = [];        

            while (col >= 0 && row >= 0) {
                cells.push(board[row][col]);

                col--;
                row--;
            };                            
            resolve({ direction: 'nw', cells: cells});
        });                
    }   
    
    checkNorthEast(row: number, col: number, board: any): Promise<any> {        
        return new Promise((resolve, reject) => {
            
            let cells = [];

            while (col < this.config.colCount && row >= 0) {
                cells.push(board[row][col]);

                col++;
                row--;
            };                    
            resolve({ direction: 'ne', cells: cells});
        });                
    }    
    
    checkLeftSkewed(row: number, col: number, board: any): Promise<any> {
        return new Promise((resolve, reject) => {
            
            let cells = [];
            let shadowCells = [];
            let shadowCol = +col - 1;
            let shadowRow = +row + 1;

            while (col < this.config.colCount && row >= 0) {
                cells.push(board[row][col]);

                col++;
                row--;
            };        
            
            while (shadowCol >= 0 && shadowRow < this.config.rowCount) {
                shadowCells.push(board[shadowRow][shadowCol]);
                
                shadowCol--;
                shadowRow++;
            }
                        
            resolve({ direction: 'ls', cells: cells.reverse().concat(shadowCells) });
        });                        
    }
    
    checkRightSkewed(row: number, col: number, board: any): Promise<any> {
        return new Promise((resolve, reject) => {
            
            let cells = [];
            let shadowCells = [];
            let shadowCol = +col + 1;
            let shadowRow = +row + 1;            

            while (col >= 0 && row >= 0) {
                cells.push(board[row][col]);

                col--;
                row--;
            };              
            
            while (shadowCol < this.config.colCount && shadowRow < this.config.rowCount) {
                shadowCells.push(board[shadowRow][shadowCol]);
                
                shadowCol++;
                shadowRow++;
            }                  
            resolve({ direction: 'rs', cells: cells.reverse().concat(shadowCells) });
        });                        
    }
    
    getPosition(row: number, col: number) {        
        
        let paddingSize = (this.colSize / 2);
        let x = this.startX + this.colSize * (1 + col) - paddingSize;
        let y = this.colSize + this.colSize * (1 + row) - paddingSize;
        
        return [x, y];        
    }    
    
    isPointingTheFirstRow(event): boolean {        
        return (event.y < this.config.top + this.colSize)        
    }           
    
    getPointingCol(event: any): number {
        return Math.floor((event.x - this.startX) / this.colSize) - 1;
    }    
    
    getAvailableRow(col: number): number {        
                
        for (let row = this.config.rowCount - 1; row >= 0; row--) {
            if (this.board[row][col] == 0) return row;
        }
        return -1;
    }
    
    hasAvailableCell(col: number): boolean { 
        let row = this.getAvailableRow(col);
        return row >= 0 && row < this.config.rowCount;        
    }
    
    hasAvailableMove(): boolean {
        for (let col = 0; col < this.config.colCount; col++) {
            if (this.hasAvailableCell(col)) return true;
        }
        return false;
    }
    
    drawCoin(col: number, row?: number, color?: string) {
        
        if (col < 0 || row < 0 || col > this.config.colCount || row > this.config.rowCount) return;
        
        this.clearDraw();
        
        let [x, y] = this.getPosition(row || -1, col);
        
        this.setCoinColor(color);
        this.context.beginPath();
        this.context.arc(x, y, this.radius, 0, Math.PI*2, true);
        this.context.fill();                  
    }
    
    clearDraw() {        
        this.context.clearRect(0, 0, this.frameSize, this.colSize);        
    }    
    
    getCoinColor(turnPlayer: number): string {
        return (turnPlayer == this.RED) ? this.config.red : this.config.blue;
    }
    
    setCoinColor(color?: string) {
        this.context.fillStyle = color || this.getCoinColor(this.turnPlayer);
    }    
    
    setOccupied(row: number, col: number) {
        this.board[row][col] = this.turnPlayer;
    }    
    
    isOccupied(row: number, col: number) {
        return (this.board[row][col] != 0) ? true : false;
    }
    
    printBoard() {
        let output = '';
        
        for (let row = 0; row < this.config.rowCount; row++) {
            
            for (let col = 0; col < this.config.colCount; col++) {
                output += this.board[row][col] + ',';
            }
            
            output += "\n";
        }
        console.log(output);        
    }
}
