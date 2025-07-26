import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import MyChildrenPage from './components/MyChildrenPage';
import AddChildPage from './components/AddChildPage';
import EditChildPage from './components/EditChildPage';
import GrowthChartPage from './components/GrowthChartPage';
import HealthProfilePage from './components/HealthProfilePage';
import './App.css';

const App = () => {
    const isLoggedIn = () => localStorage.getItem('loggedInUser');

    return (
        <Router>
            <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/dashboard" component={DashboardPage} />
                <Route path="/my-children" component={MyChildrenPage} />
                <Route path="/add-child" component={AddChildPage} />
                <Route path="/edit-child/:id" component={EditChildPage} />
                <Route path="/growth-chart/:childId" component={GrowthChartPage} />
                <Route path="/health-profile/:childId" component={HealthProfilePage} />

                <Route path="/">
                    <Redirect to={isLoggedIn() ? "/dashboard" : "/login"} />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;