const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const multer = require('multer')
const bcrypt = require('./bcrypt.js')
const sendToS3 = require('./toS3').toS3;
const spicedPg = require('spiced-pg')
const path = require('path')
const uidSafe = require('uid-safe')
const db = spicedPg(process.env.DATABASE_URL || 'postgres:postgres:postgres@localhost:5432/users');
const server = require('http').Server(app);
const io = require('socket.io')(server);

/* Configuration */
app.use(cookieSession({
    name: 'session',
    secret: 'a really hard to guess secret',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json())

app.use(compression());

app.use('/public', express.static(__dirname + '/public'));

if (process.env.NODE_ENV != 'production') {
    app.use('/bundle.js', require('http-proxy-middleware')({target: 'http://localhost:8081/'}));
}

/*APP ROUTES*/
app.post('/upload', uploader.single('file'), (req, res) => {
    console.log('inside upload route');
    if (req.file) {
        console.log('recieved');
        sendToS3(req.file).then(() => {
            console.log(req.file.filename);
            const q = `UPDATE users SET image=$1 WHERE id=$2`
            const params = [req.file.filename, req.session.user.id]
            console.log('params', params);
            db.query(q, params).then((result) => {
                var url = 'https://s3.amazonaws.com/spicedling/' + req.file.filename
                req.session.user.url = url
                res.json({success: true, url: url});
            })
        }).catch((err) => {
            console.log(err);
            res.json({success: false})
        })
    } else {
        res.json({success: false});
    }
});

app.get('/welcome', (req, res) => {
    if (req.session.user) {
        res.redirect('/')
    } else {
        res.sendFile(__dirname + '/index.html')
    }
})

app.post('/register', (req, res) => {
    console.log(req.body);
    if (!req.body.first || !req.body.last || !req.body.email || !req.body.password) {
        res.json({success: false})
    } else {
        const email = [req.body.email]
        const q = `SELECT * FROM users WHERE users.email=$1`
        db.query(q, email).then((result) => {
            if (result.rows[0]) {
                res.json({success: false})
            } else {
                const {first, last, email} = req.body;
                const q = `INSERT INTO users (first, last, email, password) VALUES ($1,$2,$3,$4) RETURNING id;`

                bcrypt.hashPassword(req.body.password).then((hash) => {
                    db.query(q, [first, last, email, hash]).then((results) => {
                        req.session.user = {
                            first: first,
                            last: last,
                            id: results.rows[0].id
                        }
                        res.json({success: true})
                    })
                })
            }
        })
    }
})

app.post('/login', function(req, res) {
    if (!req.body.email || !req.body.password) {
        res.json({success: false})
    } else {
        const email = [req.body.email]
        const q = `SELECT * FROM users WHERE email=$1`
        db.query(q, email).then((result) => {
            const data = result.rows[0];
            if (data) {
                bcrypt.checkPassword(req.body.password, data.password).then((doesMatch) => {
                    if (doesMatch) {
                        req.session.user = {
                            first: data.first,
                            last: data.last,
                            image: data.image,
                            id: data.id
                        }
                        console.log('inside post login setting session', req.session);
                        res.json({success: true})
                    } else {
                        res.json({success: false})
                    }
                })
            } else {
                res.json({success: false})
            }
        })
    }
});

app.post('/editbio', (req, res) => {
    const q = `UPDATE users SET bio=$1 WHERE id=$2 RETURNING bio`
    const params = [req.body.bio, req.session.user.id]
    db.query(q, params).then((result) => {
        const {bio} = result.rows[0]
        res.json({success: true, bio: bio})
    })
})


app.get('/user', (req, res) => {
    const q = `SELECT * FROM users WHERE id=$1`
    const params = [req.session.user.id]
    db.query(q, params).then((result) => {
        let {first,last,bio,image,id} = result.rows[0]
        if(image == null){
            image = "http://cdn.osxdaily.com/wp-content/uploads/2014/07/users-and-groups-icon-mac.png"
        }else{
            image = `https://s3.amazonaws.com/spicedling/${image}`
        }
        res.json({
            first: first,
            last: last,
            bio: bio,
            image: image,
            id: id
        })
    })
})


app.get('/user/:id/info', (req, res) => {
    const user_id = req.session.user.id;
    const paramsId = req.params.id;

    const select = `SELECT * FROM users WHERE id=$1`

    const getUsers = `SELECT * FROM friend_requests
                WHERE (sender= $1 AND recipient= $2)
                OR (recipient= $1 AND sender= $2)`


    Promise.all([
        db.query(select, [req.params.id]),
        db.query(getUsers, [user_id, paramsId])
    ])

    .then((result) =>{
        console.log('users result 1', result[0].rows);
        console.log('users result 2', result[1].rows);

        if(result[1].rows.length === 0){
            console.log('RESULTS', result[1].rows.length);
            let {first, last, bio, id, image} = result[0].rows[0]
            let userIsLoggedIn

            console.log(first, 'david is great');

            if(user_id == id){
                userIsLoggedIn= true
            }

            if(image == null){
                image = 'http://cdn.osxdaily.com/wp-content/uploads/2014/07/users-and-groups-icon-mac.png'
            }else{
                image = `https://s3.amazonaws.com/spicedling/${image}`
            }

             res.json({
                first: first,
                last: last,
                bio: bio,
                id: id,
                image: image,
                userIsLoggedIn: userIsLoggedIn,
                friendshipStatus: {
                   status: 0,
                   message: "no entry"
                }
            })
        }else{
            let {first, last, bio, id, image} = result[0].rows[0]
            let {sender, recipient, status} = result[1].rows[0]

            if(image === null){
                image = 'http://cdn.osxdaily.com/wp-content/uploads/2014/07/users-and-groups-icon-mac.png'
            }else{
                image = `https://s3.amazonaws.com/spicedling/${image}`
            }

            let message;

            if(status == PENDING){
                if(req.session.user.id == sender){
                    message= 'WaitingForAccept'
                }else{
                    message= 'HasToConfirm'
                }
            }
            if(status == ACCEPTED) {
                message= 'canTerminate'
            }
            if(status == TERMINATED){
                message= 'changeToMakeRequest'
            }
            if(status == DECLINED) {
                message= 'changeToMakeRequest'
            }
            res.json({
                first: first,
                last: last,
                bio: bio,
                image: image,
                id: id,
                friendshipStatus: {
                    status: status,
                    message: message
               }
           })
        }
    })
})
const PENDING = 1,
ACCEPTED = 2,
DECLINED = 3,
TERMINATED = 4,
REJECTED = 5


app.post('/friendshipStatus/user/:id', (req, res) =>{
    const {updatedStatus} = req.body;
    const user_id = req.session.user.id;
    const paramsId = req.params.id;
    console.log(updatedStatus);
    if(updatedStatus == 1){
        const select = `SELECT * FROM friend_requests
            WHERE (sender = $1 AND recipient = $2)
            OR (recipient = $1 AND sender = $2)`
            db.query(select, [user_id, paramsId])
            .then((result) => {
                if(result.rows[0]){
                    const update= `UPDATE friend_requests
                    SET status= $1, sender=$2, recipient= $3
                    WHERE (sender= $2 AND recipient= $3)
                    OR (recipient=$2 AND sender=$3)
                    RETURNING status, sender, recipient`
                    db.query(update, [updatedStatus, user_id, paramsId])
                    .then((result) => {
                        const {status, sender} = result.rows[0]
                        let message
                        if(status === PENDING){
                            if (user_id == sender) {
                                message = 'WaitingForAccept'
                            } else{
                                message = 'HasToConfirm'
                            }
                        }
                        res.json({
                            success: true,
                            status: status,
                            message: message
                        })
                    })
                }else{
                    const insert =`INSERT INTO friend_requests (sender, recipient, status)
                                   VALUES ($1, $2, $3) RETURNING status, sender`
                    db.query(insert, [user_id, paramsId, updatedStatus])
                    .then((result) => {
                            const {status, sender} = result.rows[0]
                            let message
                        if(status == PENDING){
                            if(user_id == paramsId){
                                message= 'WaitingForAccept'
                            }else{
                                message= 'HasToConfirm'
                            }
                        }
                        res.json({
                            status: status,
                            message: message
                        })
                    })
                }
            })
        }
        else if(updatedStatus == 2){
            const update= `UPDATE friend_requests
                            SET status=$1, sender=$2, recipient=$3
                            WHERE (sender=$2 AND recipient=$3)
                            OR (recipient=$2 AND sender=$3)
                            RETURNING status, sender, recipient`
            db.query(update, [updatedStatus, user_id, paramsId])
            .then((result) => {
                res.json({
                    status: result.rows[0].status,
                    message: 'canTerminate'
                })
            })
        }
        else if(updatedStatus == 3){
            const update = `UPDATE friend_requests
                            SET status=$1, sender=$2, recipient=$3
                            WHERE (sender=$2 AND recipient=$3)
                            OR (recipient=$2 AND sender=$3)
                            RETURNING status, sender, recipient`
            db.query(update, [updatedStatus, user_id, paramsId])
            .then((result) => {
                res.json({
                    status: result.rows[0].status,
                    message: 'changeToMakeRequest'
                })
            })
        }
        else if(updatedStatus == 4){
            const update = `UPDATE friend_requests
                            SET status=$1, sender=$2, recipient=$3
                            WHERE (sender=$2 AND recipient=$3)
                            OR (recipient=$2 AND sender=$3)
                            RETURNING status, sender, recipient`
            db.query(update, [updatedStatus, user_id, paramsId])
            .then((result) => {
                res.json({
                    status: result.rows[0].status,
                    message: 'changeToMakeRequest'
                })
            })
        }
})

app.get('/logout', (req, res) =>{
    req.session = null;
    res.redirect('/welcome')
})

app.get('/friendRequests', (req, res)=>{
    const q = `SELECT users.id, first, last, image, status
                FROM friend_requests
                JOIN users
                ON (status = ${PENDING} AND recipient = $1 AND sender = users.id)
                OR (status = ${ACCEPTED} AND recipient = $1 AND sender = users.id)
                OR (status = ${ACCEPTED} AND sender = $1 AND recipient = users.id)`
    const params= [req.session.user.id]
        db.query(q, params)
        .then((result)=>{
        const friends = result.rows
        console.log('my amazing friends',friends);
        friends.forEach((friend) => {
            console.log(friend);
            if(friend.image === null){
                friend.image = 'http://cdn.osxdaily.com/wp-content/uploads/2014/07/users-and-groups-icon-mac.png'
            }else {
                friend.image = `https://s3.amazonaws.com/spicedling/${friend.image}`
            }
        })
        res.json({
            friends: friends
        })
    }).catch((err)=>{
        console.log('friendRequests', err);
    })
})

app.post('/acceptFriendRequest/:id', (req, res) => {
    const q = `UPDATE friend_requests SET status = $1, sender = $2, recipient = $3
                WHERE (sender = $2 AND recipient = $3)
                OR (recipient = $2 AND sender = $3)
                RETURNING sender, recipient, status`
    const params = [2, req.session.user.id, req.params.id]
    db.query(q, params)
    .then(() => {
        res.json({
            success: true
        })
    }).catch((err)=>{
        console.log('acceptFriendRequest', err);
    })
})

app.post('/rejectFriendRequest/:id', (req, res) => {
    const q = `UPDATE friend_requests SET status = $1, sender = $2, recipient = $3
                WHERE (sender = $2 AND recipient = $3)
                OR (recipient = $2 AND sender = $3)
                RETURNING sender, recipient, status`
    const params = [5, req.session.user.id, req.params.id]
    db.query(q, params)
    .then(() => {
        res.json({
            success: true
        })
    }).catch((err)=>{
        console.log('rejectFriendRequest', err);
    })
})


app.post('/endFriendship/:id', (req, res) => {
    const q = `UPDATE friend_requests SET status = $1, sender = $2, recipient = $3
                WHERE (sender = $2 AND recipient = $3)
                OR (recipient = $2 AND sender = $3)
                RETURNING sender, recipient, status`
    const params = [4, req.session.user.id, req.params.id]
    db.query(q, params)
    .then(() => {
        res.json({
            success: true
        })
    }).catch((err)=>{
        console.log('endFriendship', err);
    })
})

/*Socket io*/

let online = []
let messages = []

app.get('/connected/:socketId', (req,res)=>{

  const socketId = req.params.socketId;
  const userId = req.session.user.id;

  const userAlreadyOnline = online.find(user => user.userId == req.session.user.id)

  online.push({
    userId: userId,
    socketId: socketId
  });

  if(!userAlreadyOnline){
    let {first,last,id,bio,image} = req.session.user

    if(image === null){
        image = 'http://cdn.osxdaily.com/wp-content/uploads/2014/07/users-and-groups-icon-mac.png'
    }else{
        image = `https://s3.amazonaws.com/spicedling/${image}`
    }

    io.sockets.emit('userJoined',{
      first:first,
      last:last,
      image:image,
      id:id
    })
  }

    const query = `SELECT first,last,image,id FROM users WHERE id = ANY($1)`;
    db.query(query ,[online.map(user => user.userId)]).then(
    (result) => {

      const onlineUsers = result.rows
      onlineUsers.forEach((user)=> {
          if(user.image === null){
              user.image = 'http://cdn.osxdaily.com/wp-content/uploads/2014/07/users-and-groups-icon-mac.png'
          }else{
              user.image = `https://s3.amazonaws.com/spicedling/${user.image}`
          }
      })

      io.sockets.sockets[socketId].emit('onlineUsers',{
      onlineUsers:onlineUsers,
      messages: messages
      })
    }
  ).catch(err => console.log(err))
})

io.on('connection', (socket) => {


    socket.on('chatMessage', function(data) {
        console.log('my data',data);
      const USERID = online.filter(user => user.socketId == socket.id)[0].userId
      console.log(USERID);
      const select = "SELECT * FROM users WHERE users.id = $1"
        db.query(select, [USERID])
        .then(result => {

            console.log('this is result.rows',result.rows[0]);

          const {first,last,image} = result.rows[0]

         messages.push({
           authorId: USERID,
           msg: data.msg,
           first: first,
           last: last,
           image: `https://s3.amazonaws.com/spicedling/${image}`,
           time:new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
         })
         console.log(messages);
         io.sockets.emit('chatMessage', {
           messages: messages
         })

       })
     })

    socket.on('disconnect', () => {

      const socketDisconnect = online.filter(user => user.socketId === socket.id)[0];

      const userIndex = online.indexOf(socketDisconnect);

      online.splice(userIndex, 1);


      var anotherConnection= online.find((user) =>{
        return user.userId == socketDisconnect.userId;
      })


      if(!anotherConnection){
        io.sockets.emit('userLeft',{
          id: socketDisconnect.userId
        });
      }

  });
});



app.get('*', (req, res) => {
    if (!req.session.user) {
        res.redirect('/welcome')
    } else {
        res.sendFile(__dirname + '/index.html')
    }
})

server.listen(8080, () => {
    console.log("I'm listening.")
});
