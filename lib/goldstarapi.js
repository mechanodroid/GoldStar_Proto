var goldstarApi = exports.GoldStarApi = function(feather) {
  this.feather = feather;
};
goldstarApi.prototype = {
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
    feather.logger.info({message:'Getting achievements by user from couch.',category:'achievements.api'});
    feather.data.appdb.view("thing:achievement/achievements_by_user", {key : [userid]}, { descending: true }, function(err, dbResult) {
      if (!err) {
        feather.logger.info({message:'Found ' + dbResult.length + ' achievements.', category:'achievements.api'});
        dbResult.forEach(function(key, doc, id) {
          doc.key = key;  
          doc.id = id;
          feather.logger.debug({message:'Get Achievments by User Passing back document w/ id ' + id + ', key ' + key, category:'achievements.api'});
        });
      } else {
        feather.logger.error({message:"Error getting posts from couch", exception:err, category:'achievements.api'});
      }
      if (callback) {
        callback(err, dbResult);
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
  },
};