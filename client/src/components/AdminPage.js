import React from 'react';
import { NavLink, Switch, Route, useRouteMatch } from 'react-router-dom';
import './AdminPage.css';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import BannerManagement from './admin/BannerManagement';
import ArticleManagement from './admin/ArticleManagement';
import TicketManagement from './admin/TicketManagement';


const AdminPage = () => {
    let { path, url } = useRouteMatch();

    return (
        <div className="admin-page-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h3>مدیریت</h3>
                </div>
                <nav className="admin-nav">
                    <NavLink to={`${url}/dashboard`} activeClassName="active">داشبورد</NavLink>
                    <NavLink to={`${url}/users`} activeClassName="active">مدیریت کاربران</NavLink>
                    <NavLink to={`${url}/banners`} activeClassName="active">مدیریت بنرها</NavLink>
                    <NavLink to={`${url}/articles`} activeClassName="active">مدیریت مقالات</NavLink>
                    <NavLink to={`${url}/tickets`} activeClassName="active">تیکت‌ها</NavLink>
                </nav>
            </aside>
            <main className="admin-main-content">
                <Switch>
                    <Route exact path={path}>
                        <Redirect to={`${path}/dashboard`} />
                    </Route>
                    <Route path={`${path}/dashboard`} component={AdminDashboard} />
                    <Route path={`${path}/users`} component={UserManagement} />
                    <Route path={`${path}/banners`} component={BannerManagement} />
                    <Route path={`${path}/articles`} component={ArticleManagement} />
                    <Route path={`${path}/tickets`} component={TicketManagement} />
                </Switch>
            </main>
        </div>
    );
};

export default AdminPage;
