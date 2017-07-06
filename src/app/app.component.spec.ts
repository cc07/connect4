import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppComponent } from './app.component';
import { XavierService } from './service';

describe('AppComponent', () => {

    let comp: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            providers: [ { provide: XavierService } ]
        }).compileComponents();
    }));
    
    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);

        comp = fixture.componentInstance; 
    });
    
    it('close the game whenever 4 nodes horizontally connected', async () => {
        
        comp.initGame();
        
        let board = comp.board;        
        
        for (let i = 0; i < 4; i++) {
            board[board.length - 1][i] = 1;
        }
        
        for (let i = 0; i < 4; i++) {
            expect(await comp.checkEndGame(0, i)).toBe(true);        
        }
        
    });
    
    it('close the game whenever 4 nodes vertically connected', async () => {
        
        comp.initGame();
        
        let board = comp.board;        
        
        for (let i = 0; i < 4; i++) {
            board[i][4] = 1;
        }
        
        for (let i = 0; i < 4; i++) {
            expect(await comp.checkEndGame(i, 4)).toBe(true);        
        }
        
    });    
    
    it('resumt the game whenever less than 4 nodes vertically connected', async () => {
        
        comp.initGame();
        
        let board = comp.board;        
        
        for (let i = 0; i < 2; i++) {
            board[i][4] = 1;
        }
        
        for (let i = 3; i < 4; i++) {
            board[i][4] = 1;
        }
        
        for (let i = 0; i < 4; i++) {
            expect(await comp.checkEndGame(i, 4)).toBe(false);        
        }
        
    });        

});
