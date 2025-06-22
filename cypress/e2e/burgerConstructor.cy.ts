import * as authTokens from '../fixtures/token.json';
import * as orderData from '../fixtures/order.json';

const BUN_INGREDIENT = '[data-cy=bun]';
const MAIN_INGREDIENT = '[data-cy=main]';
const SAUCE_INGREDIENT = '[data-cy=sauce]';
const ADD_BUN_BUTTON = `${BUN_INGREDIENT} > .common_button`;
const ADD_MAIN_BUTTON = `${MAIN_INGREDIENT} > .common_button`;
const ADD_SAUCE_BUTTON = `${SAUCE_INGREDIENT} > .common_button`;
const CONSTRUCTOR_ITEM_TEXT = '.constructor-element > .constructor-element__row > .constructor-element__text';
const CREATE_ORDER_BUTTON = '[data-cy=create-order-button]';
const MODAL = '#modals > div:first-child';
const MODAL_HEADER = `${MODAL} h3`;
const MODAL_CLOSE_BUTTON = `${MODAL} button`;
const MODAL_OVERLAY = '#modals > div:nth-child(2)';

describe('Интеграционные тесты для страницы конструктора', () => {
  beforeEach(() => {
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' });
    cy.intercept('GET', 'api/auth/user', { fixture: 'user.json' });
    cy.visit('/');
  });

  describe('Тестирование загрузки ингредиентов и добавления их в конструктор', () => {
    it('Добавление булок и ингредиентов в заказ', () => {
      cy.get(ADD_BUN_BUTTON).first().click();
      cy.get(ADD_MAIN_BUTTON).first().click();
      cy.get(ADD_SAUCE_BUTTON).first().click();

      cy.get(CONSTRUCTOR_ITEM_TEXT).first().contains('Краторная булка N-200i (верх)');
      cy.get(CONSTRUCTOR_ITEM_TEXT).eq(1).contains('Биокотлета из марсианской Магнолии');
      cy.get(CONSTRUCTOR_ITEM_TEXT).eq(2).contains('Соус Spicy-X');
      cy.get(CONSTRUCTOR_ITEM_TEXT).last().contains('Краторная булка N-200i (низ)');
    });
  });

  describe('Тестирование работы модального окна для ингредиента', () => {
    it('Открытие и проверка содержимого модального окна', () => {
      cy.get(BUN_INGREDIENT).first().click();
      cy.get(MODAL).should('be.visible');
      cy.get(MODAL_HEADER).contains('Краторная булка N-200i');
    });

    it('Закрытие модального окна по крестику', () => {
      cy.get(BUN_INGREDIENT).first().click();
      cy.get(MODAL).as('modal');
      cy.get(MODAL_CLOSE_BUTTON).click();
      cy.get('@modal').should('not.exist');
    });

    it('Закрытие модального окна по клику на оверлей', () => {
      cy.get(BUN_INGREDIENT).first().click();
      cy.get(MODAL).should('be.visible');
      cy.get(MODAL_OVERLAY).click({ force: true });
      cy.get(MODAL).should('not.exist');
    });
  });

  describe('Тестирование создания заказа', () => {
    beforeEach(() => {
      cy.setCookie('accessToken', authTokens.accessToken);
      localStorage.setItem('refreshToken', authTokens.refreshToken);
      cy.intercept('POST', 'api/orders', { fixture: 'order.json' }).as('createOrder');
    });

    it('Полный прогон создания заказа и очистка конструктора', () => {
      cy.get(ADD_BUN_BUTTON).first().click();
      cy.get(ADD_MAIN_BUTTON).first().click();
      cy.get(ADD_SAUCE_BUTTON).first().click();

      cy.get('button').contains('Оформить заказ').click();

      cy.wait('@createOrder');
      cy.get(MODAL).should('be.visible');
      cy.get(MODAL).find('h2').contains(orderData.order.number);

      cy.get(MODAL_CLOSE_BUTTON).click();
      cy.get(MODAL).should('not.exist');

      cy.get(CONSTRUCTOR_ITEM_TEXT).should('not.exist');
      cy.contains('Выберите булки').should('be.visible');
      cy.contains('Выберите начинку').should('be.visible');
    });

    afterEach(() => {
      cy.clearAllCookies();
      localStorage.clear();
    });
  });
});