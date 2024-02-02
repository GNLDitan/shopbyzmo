
import { DashboardBlog } from "./dashboard-blog";
import { DashboardLoyalty } from "./dashboard-loyalty";
import { DashboardOrders } from "./dashboard-orders";
import { DashboarProducts } from "./dashboard-products";

export class Dashboard {
    outOfStock: number;
    delayedPayment: number;
    orderCount: number;
    userSubscribed: number;
    orders: DashboardOrders;
    recentBlogComment: Array<DashboardBlog>;
    mostProduct: Array<DashboarProducts>;
    mostLoyaltyUser: Array<DashboardLoyalty>;

    constructor() {
        this.recentBlogComment = new Array();
        this.mostLoyaltyUser = new Array();
        this.mostProduct = new Array();
        this.orders = new DashboardOrders();
    }
}
