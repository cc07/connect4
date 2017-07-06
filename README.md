# Connect4

This a game for 2 players who first earned 4 consecutive nodes won.

## Installation

The game is hosted at https://connect4-99da5.firebaseapp.com/, it can be accessed from desktop, mobile or any device with modern internet browser.
However, it could also be served standalone by cloning the dist folder in this repo (https://github.com/cc07/connect4).

## Technical structure

This project builded with Angular4, which is a popular JavaScript framework supported by Google. It works across any platform those support modern JavaScript.
The game is primarily processed by the app.component in all aspects, and with a simple computer AI for single player as a service in xavier.service.

## Operation flow

The main app.component will first create the game board, and wait for user input. Either the user choose 1 player or 2 players, the starting player will be randomly chose for the first round and the previous loser later on. As if the AI move first, it will compulsory to take the middle of the first row in order to take the first mover advantage. The game will finish whenever any player have a consecutive 4 nodes or all nodes in the board were filled.

## Advance AI

Currently, the AI will take the highest point node computed for his round. And for further, it could compute the node value for the next user move, in order to minimize the user's gain.

## Other projects

Recently, i do have two other projects also builded with Angular4. https://appetit.hk as a F&B platform and a http://vinum.life for a simple social platform for wine lover.