const mongoDBConnectionString = "mongodb+srv://dbUser1:12345@cluster0.umcvw.mongodb.net/blog?retryWrites=true&w=majority";
const HTTP_PORT = process.env.PORT || 8080;

const express = require("express");
const cors = require("cors");
// const bodyParser = require('body-parser');
// body-parser는 express 의 미들웨어였는데, 분리외었다가,
// express 4.16.0 부터는  아예 express 에 포함되었다. 

const dataService = require("./modules/data-service.js");
const data = dataService(mongoDBConnectionString);

const app = express();

app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded ({extended : false}));  // parse requests of content-type - application/x-www-form-urlencoded


app.use(cors());
// CORS는 " 교차 출처 리소스 공유" Cross Origin Resource Sharing 의 약자로
// 도메인 및 포트가 다른 서버로 클라이언트가 요청했을 때
// 브라우저가 보안상의 이유로 API를 차단하는 문제입니다.
// 이렇게 한번만 써 놓으면, 모든 app.~ 에서 다른 도메인이나 포트로의 요청도 가능해진다.

// var corsOptions = { origin: "http://localhost:8081" };
// app.use(cors(corsOptions));


// simple route   // 이건 그냥 테스트용. 지워라. 
// app.get("/", (req, res) => {
//     res.json({ message: "<h1>Welcome</h1>" });
// });


app.post("/api/posts", (req,res)=>{
    data.addNewPost(req.body).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
});

// IMPORTANT NOTE: ?tag=#funny wll not function, but ?tag=funny will
app.get("/api/posts", (req,res) => {
    data.getAllPosts(req.query.page, req.query.perPage, req.query.category, req.query.tag).then((data)=>{
        res.json(data);
    })
    .catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    })
});

app.get("/api/categories", (req,res)=>{
    data.getCategories().then((data)=>{
        res.json(data);
    })
    .catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    })
});

app.get("/api/tags", (req,res)=>{
    data.getTags().then((data)=>{
        res.json(data);
    })
    .catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    })
});

app.get("/api/posts/:id",(req,res)=>{
    data.getPostById(req.params.id).then(data=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
});

app.put("/api/posts/:id", (req,res)=>{
    data.updatePostById(req.body,req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
});

app.delete("/api/posts/:id", (req,res)=>{
    data.deletePostById(req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
});


// Connect to the DB and start the server

data.connect().then(()=>{ // connect를 하고, 그리고 listen.
    app.listen(HTTP_PORT, ()=>{console.log("API listening on: " + HTTP_PORT)});
})
.catch((err)=>{
    console.log("unable to start the server: " + err);
    process.exit();
});
