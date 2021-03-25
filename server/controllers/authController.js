const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const {username, password, isAdmin} = req.body
        
        const db = req.app.get('db')

        try{
            const [existingUser] = await db.get_user(username)

            if(existingUser) {
                return res.status(409).send(`User already exists`)
            }

            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)

            const [registeredUser] = await db.register_user(isAdmin, username, hash)

            const user = registeredUser

            req.session.user = { isAdmin: user.is_admin, username: user.username, id: user.id}
            
            res.status(201).send(registeredUser)


        } catch(err) {
            console.log(err)
            return res.sendStatus(500)
        } 
    },
    login: async (req, res) => {
        const {username, password} = req.body
        const foundUser = await req.app.get('db').get_user([username])
        const user = foundUser[0]
        if (!user) {
            return res.status(401).send(`User not found. Please register`)
        }
        const isAuthenticated = bcrypt.compareSync(password, user.hash)
        if(!isAuthenticated){
            return res.status(403).send(`Incorrect password`)
        }
        req.session.user = {
            isAdmin: user.is_admin, id: user.id, username: user.username
        }
        return res.send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    }

}