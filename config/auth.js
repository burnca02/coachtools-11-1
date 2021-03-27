//sets up authentication for user specific pages. This ensures that no user specific page is viewable
//unless you are logged in. Redirects to login screen if not logged in.
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/users/login');
    }
}