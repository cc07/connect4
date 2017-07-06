import { Connect4Page } from './app.po';

describe('connect4 App', () => {
  let page: Connect4Page;

  beforeEach(() => {
    page = new Connect4Page();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
