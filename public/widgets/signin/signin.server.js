exports.getWidget = function(feather, cb) { 
  cb(null, {
    name: "blog.signin",
    path: "widgets/signin/",
    prototype: {
      addAchievement: feather.Widget.serverMethod(function(user, pass, _cb){        
        feather.blog.api.saveAchievement(user, function(err, result){
          _cb(err, result);
        });
      }),

      getAchievementsByDomainGroup: feather.Widget.serverMethod(function(user, pass, _cb){        
        feather.blog.api.getAchievementsByDomainGroup(achievementByDom, owningDom, function(err, result){
          _cb(err, result);
        });
        var tester = 1;
      }),

      getAchievementsByUser: feather.Widget.serverMethod(function(user, _cb){        
        feather.blog.api.getAchievementsByUser(user, function(err, result){
          _cb(err, result);
        });
        var tester = 1;
      }),      

      /*getAchievementsByDomainGroup
      owning_domain

      getAchievementsByUser
      userid

      getAchievementDomain
      id

      saveAchievementDomain
      id
      domain

      achievementDomainIsInvalid
      achievementDomain

      saveAchievement
      achievement

      achievementIsInvalid
      achievement

      awardAchievement
      achievementid
      userid*/



      verifySignin: feather.Widget.serverMethod(function(_cb) {
        if (this.request.session && this.request.session.user) {
          _cb(null, this.request.session.user);
        } else {
          _cb("No user in session");
        }
      })
    }   
  });
};