import { Injectable } from '@angular/core';

@Injectable()
export class XavierService {
    
    game;

    constructor() { }
    
    async requestDrop(game): Promise<number> {
        
        this.game = game;
        let cell: any;
        
        if (this.isFirstRound()) {
            cell = { row: 5, col: 3 };
        } else {
            let possibleMove = this.computePossibleMove();         
            cell = await this.computeMinMaxValue(possibleMove);
        }
        this.printCellValues();
        return parseInt(cell.col);
    }
    
    isFirstRound(): boolean {        
        for (let col = 0; col < this.game.config.colCount; col++) {
            if (this.game.isOccupied(this.game.config.rowCount-1, col)) return false;
        }
        return true;
    }
    
    computePossibleMove() {
        
        let cells = [];
        
        for (let col = 0; col < this.game.config.colCount; col++) {

            let row = this.game.getAvailableRow(col);            
            
            if (this.game.hasAvailableCell(col)) {
                cells.push({ row: String(row), col: String(col) });
            } 
        }
        
        return cells;
    }
    
    async computeMinMaxValue(move) {
        
        let promise = [];
        let result: any = null;

        for (let cell of move) { 
            promise.push(this.computeCellValue(cell.row, cell.col));
        }
        
        for (let v of promise) {
            
            let cellValue = await v;
                       
            if (!result || cellValue.value > result.value) {
                result = cellValue;
            }
        }
        
        return new Promise((resolve, reject) => {           
            resolve(result);
        });
                
    }
    
    computeCellValue(row: number, col: number): Promise<any> {
        return new Promise((resolve, reject) => {            
            
            let checking = [
                this.game.checkSouth(row, col, this.game.board),
                this.game.checkWest(row, col, this.game.board),
                this.game.checkEast(row, col, this.game.board),
                this.game.checkSouthWest(row, col, this.game.board),
                this.game.checkSouthEast(row, col, this.game.board),
                this.game.checkNorthWest(row, col, this.game.board),
                this.game.checkNorthEast(row, col, this.game.board),
                this.game.checkLeftSkewed(row, col, this.game.board),
                this.game.checkRightSkewed(row, col, this.game.board)
            ];

            return Promise.all(checking).then((result) => {
                
                let cellValue = 0;
                let opponent = this.game.turnPlayer * -1;
                //console.log(`cell value for row: ${row}, col:${col}`);
                
                for (let set of result) {
                    //console.log(`set ${set.direction}: ${set.cells.join(',')}`);                    
                    
                    //let multiplier = (set.direction == 's') ? 1.5 : 1;
                    let multiplier = 2;
                    
                    for (let i = 1; i < set.cells.length; i++) {
                        
                        if (set.cells[i] == opponent) {                            
                            cellValue += 2 * multiplier;                            
                            multiplier *= cellValue;
                        } else if (set.cells[i] != opponent) {
                            break;
                        } else {
                            cellValue++;
                        }
                                                
                    }
                    
                    multiplier = 1.5;
                    
                    for (let i = 1; i < set.cells.length; i++) {
                        
                        if (set.cells[i] == this.game.turnPlayer) {                            
                            cellValue += 1 * multiplier;           
                            multiplier *= cellValue;                 
                        } else if (set.cells[i] == opponent) {
                            break;
                        } else {
                            cellValue++;
                        }
                        
                    }

                }                
                resolve({ row: row, col: col, value: cellValue });
            });
        });
    }

    async printCellValues() {
        
        this.game.printBoard();
        
        let output = '';
        
        for (let row = 0; row < this.game.board.length; row++) {
            
            for (let col = 0; col < this.game.board[row].length; col++) {
                
                if (!this.game.isOccupied(row, col) && this.game.getAvailableRow(col) == row) {
                    let cellValue = await this.computeCellValue(row, col);
                    output += cellValue.value + ',';
                } else {
                    output += 0 + ',';
                }
                
            }
            
            output += "\n";
        }
        console.log(output);
    }
    
}
