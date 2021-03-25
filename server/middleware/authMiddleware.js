module.exports = {
    usersOnly: (req, res, next) => {
        if (!req.session.user){
            return res.status(401).send('Log in')
        }
        next()
    },

    adminsOnly: (req, res, next) => {
        if(!req.session.user.isAdmin){
            return res.status(403).send('You are not an admin')
        }
        next()
    }
}