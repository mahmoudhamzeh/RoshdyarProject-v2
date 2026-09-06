import React from 'react';
import { NavLink, Switch, Route, useRouteMatch, Redirect, useLocation } from 'react-router-dom';
import './AdminPage.css';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import UserDetailPage from './admin/UserDetailPage';
import BannerManagement from './admin/BannerManagement';
import MagazinePostManagement from './admin/MagazinePostManagement';
import { MagazineTaxonomy, MagazineAuthors, MagazineComments, MagazineBanners } from './admin/MagazineAdmin';
import TicketManagement from './admin/TicketManagement';
import MessageManagement from './admin/MessageManagement';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement';
import VendorManagement from './admin/VendorManagement';
import OrderManagement from './admin/OrderManagement';
import CommentModeration from './admin/CommentModeration';

const SHOP_LINKS = [
    { to: 'products', label: 'محصولات' },
    { to: 'product-categories', label: 'گروه و زیرگروه' },
    { to: 'vendors', label: 'فروشندگان' },
    { to: 'orders', label: 'سفارش‌ها' },
    { to: 'comments', label: 'نظرات' },
    { to: 'banners', label: 'بنر فروشگاه' }
];

const MAGAZINE_LINKS = [
    { to: 'articles', label: 'محتوای مجله' },
    { to: 'magazine-taxonomy', label: 'دسته و برچسب' },
    { to: 'magazine-authors', label: 'نویسندگان' },
    { to: 'magazine-comments', label: 'نظرات مجله' },
    { to: 'magazine-banners', label: 'بنر مجله' }
];

const AdminPage = () => {
    const { path, url } = useRouteMatch();
    const location = useLocation();
    const shopActive = SHOP_LINKS.some((item) => location.pathname.includes(`/${item.to}`));
    const magazineActive = MAGAZINE_LINKS.some((item) => location.pathname.includes(`/${item.to}`));

    return (
        <div className="admin-page-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h3>مدیریت</h3>
                </div>
                <nav className="admin-nav">
                    <NavLink to={`${url}/dashboard`} activeClassName="active">داشبورد</NavLink>
                    <NavLink to={`${url}/users`} activeClassName="active">مدیریت کاربران</NavLink>
                    <NavLink to={`${url}/messages`} activeClassName="active">پیام‌ها</NavLink>
                    <div className={`admin-nav-group ${shopActive ? 'is-open' : ''}`}>
                        <span className={`admin-nav-heading ${shopActive ? 'is-active' : ''}`}>فروشگاه</span>
                        <div className="admin-nav-sub">
                            {SHOP_LINKS.map((item) => (
                                <NavLink key={item.to} to={`${url}/${item.to}`} activeClassName="active">
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                    <div className={`admin-nav-group ${magazineActive ? 'is-open' : ''}`}>
                        <span className={`admin-nav-heading ${magazineActive ? 'is-active' : ''}`}>مجله سلامت</span>
                        <div className="admin-nav-sub">
                            {MAGAZINE_LINKS.map((item) => (
                                <NavLink key={item.to} to={`${url}/${item.to}`} activeClassName="active">
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                    <NavLink to={`${url}/tickets`} activeClassName="active">تیکت‌ها</NavLink>
                </nav>
            </aside>
            <main className="admin-main-content">
                <Switch>
                    <Route exact path={path}>
                        <Redirect to={`${path}/dashboard`} />
                    </Route>
                    <Route path={`${path}/dashboard`} component={AdminDashboard} />
                    <Route exact path={`${path}/users`} component={UserManagement} />
                    <Route path={`${path}/users/:userId`} component={UserDetailPage} />
                    <Route path={`${path}/messages`} component={MessageManagement} />
                    <Route path={`${path}/products`} component={ProductManagement} />
                    <Route path={`${path}/product-categories`} component={CategoryManagement} />
                    <Route path={`${path}/vendors`} component={VendorManagement} />
                    <Route path={`${path}/orders`} component={OrderManagement} />
                    <Route path={`${path}/comments`} component={CommentModeration} />
                    <Route path={`${path}/banners`} component={BannerManagement} />
                    <Route path={`${path}/articles`} component={MagazinePostManagement} />
                    <Route path={`${path}/magazine-taxonomy`} component={MagazineTaxonomy} />
                    <Route path={`${path}/magazine-authors`} component={MagazineAuthors} />
                    <Route path={`${path}/magazine-comments`} component={MagazineComments} />
                    <Route path={`${path}/magazine-banners`} component={MagazineBanners} />
                    <Route path={`${path}/tickets`} component={TicketManagement} />
                </Switch>
            </main>
        </div>
    );
};

export default AdminPage;
