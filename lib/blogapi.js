var blogApi = exports.BlogApi = function(feather) {
  this.feather = feather;
};
blogApi.prototype = {
  getPosts: function(callback) {
    var feather = this.feather;
    feather.logger.info({message:'Getting posts by date from couch.',category:'blog.api'});
    feather.data.appdb.view("blogentry/posts_by_date", { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' posts.', category:'blog.api'});
        dbResult.forEach(function(key, doc, id) {
          doc.id = id;
          feather.logger.debug({message:'Found document w/ id ' + id + ', key ' + key, category:'blog.api'});
        });
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'blog.api'});
      }
      if (callback) {
        callback(err, dbResult);
      }
    }); // end couch.db.view
  },
  getPost:function(id, callback) {
    var feather = this.feather;
    feather.logger.info("Getting post " + id);
    feather.data.appdb.get(id, function(err, doc) {
      if (!err) {
        doc.pubDate = new Date(doc.pub_date[0]-0, doc.pub_date[1]-0, doc.pub_date[2]-0, doc.pub_date[3]-0, doc.pub_date[4]-0, doc.pub_date[5]-0);
      }
      callback(err, doc);
    });
  },
  savePost: function(post, callback) {
    var feather = this.feather;
    feather.logger.info({message: 'Creating post titled ${summary} with id ${id}', replacements:post, category:'blog.api'});
    var curDate = new Date();
    var dbDoc = {
      id: post.id,
      summary:post.summary,
      post:post.post,
      pub_date:curDate.toArray(),
      parent_id:post.parent_id,
      level: post.level==undefined?"0":post.level
    };
    if (dbDoc.id==undefined)
    {
      dbDoc.id=curDate.getTime().toString();
    }
    var errors = this.postIsInvalid(post);
    if (errors) {
      callback && callback({message:"Post has validation errors.", validationErrors:errors});
    } else {
      feather.data.appdb.saveOrUpdate(dbDoc, function(err, results) {
        callback && callback(err, results);
      });
    }
  },
  postIsInvalid: function(post) {
    var feather = this.feather;
    var result = [];
    if (!post) {
      return ["Post is not a valid document."]; 
    }
    if (!post.summary) {
      result.push("Summary is required.");
    } else if(typeof(post.summary) !== "string" || post.summary.match(/^\s*$/) !== null) {
      result.push("Summary must be a non-empty string.");
    }
    if (!post.post) {
      result.push("Post text is required.");
    } else if (typeof(post.post) !== "string" || post.post.match(/^\s*$/) !== null) {
      result.push("Post must be a non-empty string.");
    }
    if (result.length === 0) return null;
    return result;
  },
  cycleAchievements: function( callback) {
    var feather = this.feather;
    feather.logger.info({message:'Getting achievements by domain/group from couch.',category:'achievements.api'});
    feather.data.appdb.view("thing:achievement/default", { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' achievements.', category:'achievements.api'});
        dbResult.forEach(function(key, doc, id) {
          doc.key = key;
          doc.id = id;
          feather.logger.debug({message:'Found document w/ id ' + id + ', key ' + key, category:'achievements.api'});
        });
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'achievements.api'});
      }
      if (callback) {
        callback(err, dbResult);
      }
    }); // end couch.db.view
  },
  getAchievementsByDomainGroup: function(owning_domain, callback) {
    var feather = this.feather;
    feather.logger.info({message:'Getting achievements by domain/group from couch.',category:'achievements.api'});
    feather.data.appdb.view("thing:achievement/achievements_by_domain", {key : [owning_domain]}, { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' achievements.', category:'achievements.api'});
        dbResult.forEach(function(key, doc, id) {
          doc.key = key;  
          doc.id = id;
          feather.logger.debug({message:'Get Achievments by Domain Passing back document w/ id ' + id + ', key ' + key, category:'achievements.api'});
        });
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'achievements.api'});
      }
      if (callback) {
        callback(err, dbResult);
      }
    }); // end couch.db.view
  },
  getAchievementsByUser: function(userid,callback) {
    var feather = this.feather;
    var numFound = 0;
    var key = "";
    var id = 0;
    dbResultToPass = "";
    feather.logger.info({message:'Getting achievements by user from couch...',category:'achievements.api'});
    feather.data.appdb.view("thing:achievement/achievements_by_user", { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' achievements.', category:'achievements.api'});
        
        dbResult.forEach(function(key, id) { 
        if(key == userid){
            numFound = numFound + 1;                       
            dbResultToPass = dbResultToPass + " Achievement ID:" + id + " Achievement Key:" + key + " |||";            
            feather.logger.info({message:'Get Achievments by User Passing back document w/ id ' + id + ', key ' + key, category:'achievements.api'});
          }
        });
        if(!numFound){
          dbResult = "None Found";
        } 
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'achievements.api'});
      }
      if (callback) {
        if(!numFound){
          callback(err, dbResult);
        } else {
          callback(err, dbResultToPass);
        }
      }
    }); // end couch.db.view
  },
  getAchievementDomain:function(id, callback) {
    var feather = this.feather;
    var returnOwningID = 0;
    feather.logger.info({message:'Get achievement domain by id from couch.',category:'achievements.api'});
    feather.data.appdb.view("thing:achievement/achievements_domain", {key : [id]}, { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' achievements.', category:'achievements.api'});
        dbResult.forEach(function(key, doc, id) {
          if(doc.id == id){
            returnOwningID = doc.owning_domain;
          }
          doc.key = key;  
          doc.id = id;
          feather.logger.debug({message:'Get Achievments by User achievment back from owning id w/ id ' + id + ', key ' + key, category:'achievements.api'});
        });
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'achievements.api'});
      }
      if (callback) {
        callback(err, dbResult);
      }
      return returnOwningID;
    }); // end couch.db.view
  },
  saveAchievementDomain: function(id, domain, callback) {
    var feather = this.feather;
    feather.logger.info({message: 'Creating post titled ${summary} with id ${id}', replacements:post, category:'achievements.api'});
    var dbDoc = {
      id: post.id,
      description:post.summary,
      post:post.post,
      effective_date:(new Date()).toArray()
    };
    var errors = this.postIsInvalid(post);
    if (errors) {
      callback && callback({message:"Post has validation errors.", validationErrors:errors});
    } else {
      feather.data.appdb.saveOrUpdate(dbDoc, function(err, results) {
        callback && callback(err, results);
      });
    }
  },
  achievementDomainIsInvalid: function(achievementDomain) {
    var feather = this.feather;
    var foundDomainSomeWhere = false;
    feather.logger.info("Getting achievment domain " + id);    
    feather.data.appdb.view("thing:achievement/achievement_domain_by_id", {key : [id]}, { descending: true }, function(err, dbResult) {
      dbResult.forEach(function(key, doc, id) {
          doc.key = key;  
          doc.id = id;
          if(doc.owning_domain == achievmentDomain){
            foundDomainSomewhere = true;
          }
          feather.logger.debug({message:'Get Achievments by User Passing back document w/ id ' + id + ', key ' + key, category:'achievements.api'});
        });
      });                 
    
  },
  saveAchievement: function(achievement, callback) {
    var feather = this.feather;
    feather.logger.info({message: 'Creating post titled ${summary} with id ${id}', category:'blog.api'});
    var curDate = new Date();
    var dbDoc = {
      id: "10",
      description: achievement,      
      effective_date:curDate.toArray(),      
      
    };
    if (dbDoc.id==undefined)
    {
      dbDoc.id=curDate.getTime().toString();
    }
    var errors = false; //= this.postIsInvalid(post);
    if (errors) {
      callback && callback({message:"Save Achievement has validation errors.", validationErrors:errors});
    } else {
      feather.data.appdb.saveOrUpdate(dbDoc, function(err, results) {
        callback && callback(err, results);
      });
    }
  },
  achievementIsInvalid: function(achievement) {
    var feather = this.feather;
    var foundValid = false;
    feather.logger.info({message:'Seeing if achievement is valid.',category:'achievements.api'});
    feather.data.appdb.view("thing:achievement/default", { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' achievements.', category:'achievements.api'});
        dbResult.forEach(function(key, doc, id) {
          doc.key = key;
          doc.id = id;
          if(doc.id == achievement){
            foundValid = true;
          }
          feather.logger.debug({message:'Found document w/ id ' + id + ', key ' + key, category:'achievements.api'});
        });
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'achievements.api'});
      }
      if (callback) {
        callback(err, !foundValid);
      }
    }); // end couch.db.view  
  },
  awardAchievement: function(achievementid, userid, callback) {
   var feather = this.feather;
    feather.logger.info({message: 'Creating post titled ${summary} with id ${id}', replacements:post, category:'blog.api'});
    var curDate = new Date();
    var dbDoc = {
      id: post.id,
      description:post.description,
      post:post.post,
      effective_date:curDate.toArray(),      
      
    };
    if (dbDoc.id==undefined)
    {
      dbDoc.id=curDate.getTime().toString();
    }
    var errors = this.postIsInvalid(post);
    if (errors) {
      callback && callback({message:"Save Achievement has validation errors.", validationErrors:errors});
    } else {
      feather.data.appdb.saveOrUpdate(dbDoc, function(err, results) {
        callback && callback(err, results);
      });
    }
  }  
};