import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const AdminRoute = ({ component: Component, ...rest }) => {
    const getAdminUser = () => {
        try {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (!loggedInUser) return null;
            const user = JSON.parse(loggedInUser);
            return user && user.isAdmin ? user : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    };

    const adminUser = getAdminUser();

    return (
        <Route
            {...rest}
            render={props =>
                adminUser ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/login" />
                )
            }
        />
    );
};

export default AdminRoute;
