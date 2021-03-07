const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Added to get around the deprecation warning: "Mongoose: promise (mongoose's default promise library) is deprecated"

const postSchema = require('./post-schema.js');  // Load the schema


// module.exports = function(mongoDBConnectionString){
module.exports = mongoDBConnectionString => {

    let Post; // defined on connection to the new db instance
    // Post 는 아래 여러가지 명령에 다 쓰여질거라서 밖에서 정의한거다.

    return {
        connect: function(){
            return new Promise(function(resolve,reject){
                let connection = mongoose.createConnection(mongoDBConnectionString, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true 
                    });
                
                connection.on('error', (err)=>{
                    reject(err);
                });
        
                connection.once('open', ()=>{
                    console.log("Connected to the database!");
        // var SomeModel = mongoose.model('SomeModel', SomeModelSchema );
                    Post = connection.model("Post", postSchema);
                    // Post 라는 Model을 스키마형식에 맞춰서 만들었다.
                    // 이제 Post 를 가지고 findOne 등등을 할것이다.
                    resolve();
                });
            });
        },
        addNewPost: function(data){
            return new Promise((resolve,reject)=>{

                let newPost = new Post(data);

                newPost.save((err) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(`new post: ${newPost._id} successfully added`);
                    }
                });
            });
        },
        getAllPosts: function(page, perPage, category, tag){
            return new Promise((resolve,reject)=>{
                if(+page && +perPage){
                    
                        let filter = {}; 
                        if(category) filter.category = category;
                        if(tag) filter.tags = {$in: ["#" + tag]};

                        page = (+page) - 1;                      
                        Post.find(filter).sort({postDate: -1}).skip(page * +perPage).limit(+perPage).exec().then(posts=>{
                            resolve(posts)
                        }).catch(err=>{
                            reject(err);
                        });
                }else{
                    reject('page and perPage query parameters must be present');
                }
            });
        },
        getCategories: function(){
            return new Promise((resolve,reject)=>{
                               
                Post.find({}, '-_id category').sort().exec().then(data => {

                    let categories = data.map(cat => cat.category).sort();

                    let result = [];

                    let i = 0;
                    while (i < categories.length) {
                        let start = i;
                        while (i < categories.length && (categories[i] == categories[start])) {
                            ++i;
                        }
                        let count = i - start;
                        result.push({ cat: categories[start], num: count });
                    }

                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
             
            });
        },
        getTags: function(){
            return new Promise((resolve,reject)=>{
                               
                Post.find({}, '-_id tags').exec().then(data => {
            
                    let result = [];

                    // join the arrays
                    data.forEach(tagsObj => {
                        result = result.concat(tagsObj.tags)
                    });

                    // filter the results
                    let filteredResult = result.filter(function(item, pos){
                        return result.indexOf(item)== pos; 
                    });

                    resolve(filteredResult);
                }).catch(err => {
                    reject(err);
                });
             
            });
        },
        getPostById: function(id){
            return new Promise((resolve,reject)=>{
                Post.findOne({_id: id}).exec().then(post=>{
                    resolve(post)
                }).catch(err=>{
                    reject(err);
                });
            });
        },

        updatePostById: function(data, id){
            return new Promise((resolve,reject)=>{
                Post.updateOne({_id: id}, {
                    $set: data
                }).exec().then(()=>{
                    resolve(`post ${id} successfully updated`)
                }).catch(err=>{
                    reject(err);
                });
            });
        },
        deletePostById: function(id){
            return new Promise((resolve,reject)=>{
                Post.deleteOne({_id: id}).exec().then(()=>{
                    resolve(`post ${id} successfully deleted`)
                }).catch(err=>{
                    reject(err);
                });
            });
        }
    }
}