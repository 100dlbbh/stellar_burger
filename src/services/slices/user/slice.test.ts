// 1. Добавляем initialState в импорт из вашего файла slice.ts
import userReducer, {
  UserState,
  clearErrors,
  initialState,
} from './slice';
import { userOrders } from '../../../testData';
import { getOrdersThunk } from './actions';

describe('Тесты синхронных экшенов', () => {
  test('Проверяем очистку заказа', () => {
    // Создаем состояние с ошибкой для теста на основе импортированного initialState
    const stateWithAnError: UserState = {
      ...initialState,
      error: 'some error'
    };

    const newState = userReducer(stateWithAnError, clearErrors());
    expect(newState.error).toBeNull();
  });
});

describe('Тесты асинхронных экшенов', () => {
  describe('Тестируем getOrdersThunk', () => {
    test('Тестируем отправку запроса (pending)', async () => {
      // Здесь нам нужно чистое начальное состояние, поэтому просто используем импортированное
      const newState = userReducer(
        initialState,
        getOrdersThunk.pending('pending')
      );

      expect(newState.ordersRequest).toBeTruthy();
      expect(newState.error).toBeNull();
    });

    test('Тестируем ошибку при запросе (rejected)', async () => {
      // Для этого теста нужно состояние, в котором запрос уже выполняется
      const stateBeforeRejected: UserState = {
        ...initialState,
        ordersRequest: true
      };

      const error: Error = {
        name: 'rejected',
        message: 'Ошибка получения заказов пользователя'
      };
      const newState = userReducer(
        stateBeforeRejected,
        getOrdersThunk.rejected(error, 'rejected')
      );

      expect(newState.ordersRequest).toBeFalsy();
      expect(newState.error).toBe(error.message);
    });

    test('Тестируем успешный запрос (fulfilled)', async () => {
      // Аналогично, нужно состояние, в котором запрос уже выполняется
      const stateBeforeFulfilled: UserState = {
        ...initialState,
        ordersRequest: true
      };

      const newState = userReducer(
        stateBeforeFulfilled,
        getOrdersThunk.fulfilled(userOrders, 'fulfilled')
      );

      expect(newState.orders).toEqual(userOrders);
      expect(newState.ordersRequest).toBeFalsy();
      expect(newState.error).toBeNull();
    });
  });
});