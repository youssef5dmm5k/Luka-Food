import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Category, CategoryInput, HealthStatus, ListMenuItemsParams, ListOrdersParams, MenuItem, MenuItemInput, MenuItemPatch, Order, OrderInput, OrderStats, OrderStatusPatch } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCategoriesUrl: () => string;
/**
 * @summary List all categories
 */
export declare const listCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCategoryUrl: () => string;
/**
 * @summary Create a category
 */
export declare const createCategory: (categoryInput: CategoryInput, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CategoryInput>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Create a category
*/
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export declare const getListMenuItemsUrl: (params?: ListMenuItemsParams) => string;
/**
 * @summary List all menu items
 */
export declare const listMenuItems: (params?: ListMenuItemsParams, options?: RequestInit) => Promise<MenuItem[]>;
export declare const getListMenuItemsQueryKey: (params?: ListMenuItemsParams) => readonly ["/api/menu-items", ...ListMenuItemsParams[]];
export declare const getListMenuItemsQueryOptions: <TData = Awaited<ReturnType<typeof listMenuItems>>, TError = ErrorType<unknown>>(params?: ListMenuItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMenuItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMenuItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMenuItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listMenuItems>>>;
export type ListMenuItemsQueryError = ErrorType<unknown>;
/**
 * @summary List all menu items
 */
export declare function useListMenuItems<TData = Awaited<ReturnType<typeof listMenuItems>>, TError = ErrorType<unknown>>(params?: ListMenuItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMenuItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMenuItemUrl: () => string;
/**
 * @summary Create a menu item
 */
export declare const createMenuItem: (menuItemInput: MenuItemInput, options?: RequestInit) => Promise<MenuItem>;
export declare const getCreateMenuItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMenuItem>>, TError, {
        data: BodyType<MenuItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMenuItem>>, TError, {
    data: BodyType<MenuItemInput>;
}, TContext>;
export type CreateMenuItemMutationResult = NonNullable<Awaited<ReturnType<typeof createMenuItem>>>;
export type CreateMenuItemMutationBody = BodyType<MenuItemInput>;
export type CreateMenuItemMutationError = ErrorType<unknown>;
/**
* @summary Create a menu item
*/
export declare const useCreateMenuItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMenuItem>>, TError, {
        data: BodyType<MenuItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMenuItem>>, TError, {
    data: BodyType<MenuItemInput>;
}, TContext>;
export declare const getUpdateMenuItemUrl: (id: number) => string;
/**
 * @summary Update a menu item
 */
export declare const updateMenuItem: (id: number, menuItemPatch: MenuItemPatch, options?: RequestInit) => Promise<MenuItem>;
export declare const getUpdateMenuItemMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
        id: number;
        data: BodyType<MenuItemPatch>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
    id: number;
    data: BodyType<MenuItemPatch>;
}, TContext>;
export type UpdateMenuItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateMenuItem>>>;
export type UpdateMenuItemMutationBody = BodyType<MenuItemPatch>;
export type UpdateMenuItemMutationError = ErrorType<void>;
/**
* @summary Update a menu item
*/
export declare const useUpdateMenuItem: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
        id: number;
        data: BodyType<MenuItemPatch>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
    id: number;
    data: BodyType<MenuItemPatch>;
}, TContext>;
export declare const getDeleteMenuItemUrl: (id: number) => string;
/**
 * @summary Delete a menu item
 */
export declare const deleteMenuItem: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMenuItemMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteMenuItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMenuItem>>>;
export type DeleteMenuItemMutationError = ErrorType<void>;
/**
* @summary Delete a menu item
*/
export declare const useDeleteMenuItem: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
    id: number;
}, TContext>;
export declare const getListOrdersUrl: (params?: ListOrdersParams) => string;
/**
 * @summary List all orders
 */
export declare const listOrders: (params?: ListOrdersParams, options?: RequestInit) => Promise<Order[]>;
export declare const getListOrdersQueryKey: (params?: ListOrdersParams) => readonly ["/api/orders", ...ListOrdersParams[]];
export declare const getListOrdersQueryOptions: <TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof listOrders>>>;
export type ListOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List all orders
 */
export declare function useListOrders<TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
/**
 * @summary Create an order
 */
export declare const createOrder: (orderInput: OrderInput, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<OrderInput>;
export type CreateOrderMutationError = ErrorType<unknown>;
/**
* @summary Create an order
*/
export declare const useCreateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getGetOrderStatsUrl: () => string;
/**
 * @summary Get order statistics for the kitchen dashboard
 */
export declare const getOrderStats: (options?: RequestInit) => Promise<OrderStats>;
export declare const getGetOrderStatsQueryKey: () => readonly ["/api/orders/stats"];
export declare const getGetOrderStatsQueryOptions: <TData = Awaited<ReturnType<typeof getOrderStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrderStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrderStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getOrderStats>>>;
export type GetOrderStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get order statistics for the kitchen dashboard
 */
export declare function useGetOrderStats<TData = Awaited<ReturnType<typeof getOrderStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrderStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdvanceOrderStatusUrl: (id: number) => string;
/**
 * @summary Advance order status to next stage
 */
export declare const advanceOrderStatus: (id: number, orderStatusPatch: OrderStatusPatch, options?: RequestInit) => Promise<Order>;
export declare const getAdvanceOrderStatusMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof advanceOrderStatus>>, TError, {
        id: number;
        data: BodyType<OrderStatusPatch>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof advanceOrderStatus>>, TError, {
    id: number;
    data: BodyType<OrderStatusPatch>;
}, TContext>;
export type AdvanceOrderStatusMutationResult = NonNullable<Awaited<ReturnType<typeof advanceOrderStatus>>>;
export type AdvanceOrderStatusMutationBody = BodyType<OrderStatusPatch>;
export type AdvanceOrderStatusMutationError = ErrorType<void>;
/**
* @summary Advance order status to next stage
*/
export declare const useAdvanceOrderStatus: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof advanceOrderStatus>>, TError, {
        id: number;
        data: BodyType<OrderStatusPatch>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof advanceOrderStatus>>, TError, {
    id: number;
    data: BodyType<OrderStatusPatch>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map